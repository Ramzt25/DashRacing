import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VehicleResolveRequest {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  region?: string;
}

interface VehicleResolveResponse {
  make: string;
  model: string;
  year: number;
  trim: string;
  specs?: {
    engine?: {
      type: string;
      displacement: number;
      cylinders: number;
      horsepower?: number;
      torque?: number;
    };
    transmission?: {
      type: 'manual' | 'automatic' | 'cvt';
      speeds: number;
    };
    drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd';
    weight?: number;
    options?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const body: VehicleResolveRequest = await req.json();
    
    // Validate input
    if (!body.vin && (!body.make || !body.model || !body.year)) {
      throw new Error('Either VIN or Make/Model/Year is required');
    }

    // Generate cache key
    const cacheKey = body.vin 
      ? `vin:${body.vin}`
      : `mmy:${body.make?.toLowerCase()}:${body.model?.toLowerCase()}:${body.year}:${body.region || 'us'}`;

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('vehicle_ai_cache')
      .select('payload')
      .eq('key', cacheKey)
      .single();

    if (!cacheError && cached) {
      console.log('Cache hit for key:', cacheKey);
      return new Response(
        JSON.stringify({
          success: true,
          data: cached.payload,
          cached: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Cache miss - call AI provider
    console.log('Cache miss for key:', cacheKey);
    
    const aiApiBase = Deno.env.get('AI_API_BASE');
    const aiApiKey = Deno.env.get('AI_API_KEY');
    
    if (!aiApiBase || !aiApiKey) {
      throw new Error('AI API configuration missing');
    }

    const identifier = body.vin 
      ? `VIN: ${body.vin}`
      : `${body.make} ${body.model} ${body.year}`;

    const prompt = `
You are an automotive database expert. Resolve the following vehicle to its exact trim and specifications.

Vehicle: ${identifier}
Region: ${body.region || 'us'}

Return ONLY a JSON object with the following structure:
{
  "make": "string",
  "model": "string", 
  "year": number,
  "trim": "string (exact trim level)",
  "specs": {
    "engine": {
      "type": "string",
      "displacement": number,
      "cylinders": number,
      "horsepower": number,
      "torque": number
    },
    "transmission": {
      "type": "manual|automatic|cvt",
      "speeds": number
    },
    "drivetrain": "fwd|rwd|awd|4wd",
    "weight": number,
    "options": ["array", "of", "standard", "options"]
  }
}

Be as accurate as possible. If uncertain about specific values, omit them rather than guess.
    `.trim();

    const aiResponse = await fetch(`${aiApiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that responds only with valid JSON. No additional text or formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    let vehicleData: VehicleResolveResponse;
    try {
      vehicleData = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }

    // Cache the result
    const { error: cacheInsertError } = await supabase
      .from('vehicle_ai_cache')
      .insert({
        key: cacheKey,
        provider: 'openai',
        payload: vehicleData
      });

    if (cacheInsertError) {
      console.warn('Failed to cache result:', cacheInsertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: vehicleData,
        cached: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Garage AI resolve error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});