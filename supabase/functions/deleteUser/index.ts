import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabase } from '../_shared/admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { data } = await supabase.auth.getUser(
      req.headers.get('Authorization')!.replace("Bearer ","")
    );
    if (!data.user) throw new Error('invalid token');
    const { error } = await supabase.auth.admin.deleteUser(data.user.id);
    if (error) throw error;
    return new Response('success', { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 400, headers: corsHeaders });
  }
});
