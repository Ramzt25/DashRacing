import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreatePinRequest {
  type: 'police' | 'hazard' | 'construction' | 'camera' | 'pothole';
  latitude: number;
  longitude: number;
  description?: string;
  photo?: string;
}

const PIN_COOLDOWN_MINUTES = 2;
const DUPLICATE_RADIUS_METERS = 100;
const PIN_TTL_MINUTES = {
  police: 45,
  hazard: 120,
  construction: 1440, // 24 hours
  camera: 10080, // 7 days
  pothole: 2880, // 48 hours
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
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

    const body: CreatePinRequest = await req.json();
    
    // Validate input
    if (!body.type || !body.latitude || !body.longitude) {
      throw new Error('Missing required fields: type, latitude, longitude');
    }

    if (!Object.keys(PIN_TTL_MINUTES).includes(body.type)) {
      throw new Error('Invalid pin type');
    }

    // Check cooldown period
    const cooldownCheck = await supabase
      .from('pins')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (cooldownCheck.data && cooldownCheck.data.length > 0) {
      const lastPin = new Date(cooldownCheck.data[0].created_at);
      const now = new Date();
      const minutesSinceLastPin = (now.getTime() - lastPin.getTime()) / (1000 * 60);
      
      if (minutesSinceLastPin < PIN_COOLDOWN_MINUTES) {
        throw new Error(`Please wait ${Math.ceil(PIN_COOLDOWN_MINUTES - minutesSinceLastPin)} minutes before creating another pin`);
      }
    }

    // Check for duplicates in the area
    const duplicateCheck = await supabase.rpc('get_nearby_pins', {
      user_lat: body.latitude,
      user_lng: body.longitude,
      radius_meters: DUPLICATE_RADIUS_METERS
    });

    if (duplicateCheck.data) {
      const recentDuplicates = duplicateCheck.data.filter((pin: any) => {
        const pinAge = (new Date().getTime() - new Date(pin.created_at).getTime()) / (1000 * 60);
        return pin.type === body.type && pinAge < 5; // 5 minutes
      });

      if (recentDuplicates.length > 0) {
        throw new Error('A similar pin was recently created in this area');
      }
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PIN_TTL_MINUTES[body.type]);

    // Create the pin
    const { data: pin, error: insertError } = await supabase
      .from('pins')
      .insert({
        user_id: user.id,
        type: body.type,
        location: `POINT(${body.longitude} ${body.latitude})`,
        description: body.description,
        photo: body.photo,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: pin
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Create pin error:', error);
    
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