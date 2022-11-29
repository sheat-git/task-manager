import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabase } from '../_shared/admin.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { data } = await supabase.auth.getUser(
      req.headers.get('Authorization')!.replace('Bearer ','')
    );
    if (!data.user) throw new Error('invalid token');
    const email = req.headers.get('email');
    if (!email) throw new Error('invalid email');
    const { error } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { email: email , email_confirm: false }
    );
    if (error) throw error;
    return new Response('success', { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 400, headers: corsHeaders });
  }
});
