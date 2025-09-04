import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VoteRequest {
  pinId: string;
  vote: 'up' | 'down';
}

const VERIFICATION_THRESHOLD = 3;
const HIDE_THRESHOLD = -2;

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

    const body: VoteRequest = await req.json();
    
    if (!body.pinId || !body.vote) {
      throw new Error('Missing required fields: pinId, vote');
    }

    if (!['up', 'down'].includes(body.vote)) {
      throw new Error('Invalid vote value');
    }

    // Upsert the vote (replace existing vote or create new one)
    const { error: voteError } = await supabase
      .from('pin_votes')
      .upsert({
        pin_id: body.pinId,
        user_id: user.id,
        vote: body.vote
      }, {
        onConflict: 'pin_id,user_id'
      });

    if (voteError) {
      throw voteError;
    }

    // Calculate new vote totals
    const { data: votes, error: votesError } = await supabase
      .from('pin_votes')
      .select('vote')
      .eq('pin_id', body.pinId);

    if (votesError) {
      throw votesError;
    }

    const upvotes = votes?.filter(v => v.vote === 'up').length || 0;
    const downvotes = votes?.filter(v => v.vote === 'down').length || 0;
    const netScore = upvotes - downvotes;

    // Update pin status based on vote thresholds
    let newStatus = 'pending';
    if (netScore >= VERIFICATION_THRESHOLD) {
      newStatus = 'verified';
    } else if (netScore <= HIDE_THRESHOLD) {
      newStatus = 'hidden';
    }

    const { error: updateError } = await supabase
      .from('pins')
      .update({ status: newStatus })
      .eq('id', body.pinId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          upvotes,
          downvotes,
          netScore,
          status: newStatus
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Vote pin error:', error);
    
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