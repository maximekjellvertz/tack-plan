import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { searchTerm, userId } = await req.json();
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return new Response(
        JSON.stringify({ competitions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching TDB competitions:', searchTerm);

    // Get user's TDB credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('tdb_credentials')
      .select('tdb_email, tdb_password_encrypted')
      .eq('user_id', userId)
      .single();

    if (credError || !credentials) {
      console.error('No TDB credentials found:', credError);
      return new Response(
        JSON.stringify({ competitions: [], needsCredentials: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tdbPassword = atob(credentials.tdb_password_encrypted);
    const competitions = await searchTDBCompetitions(credentials.tdb_email, tdbPassword, searchTerm);

    return new Response(
      JSON.stringify({ competitions, needsCredentials: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching TDB competitions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, competitions: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function searchTDBCompetitions(email: string, password: string, searchTerm: string) {
  try {
    // Login to TDB
    const loginResponse = await fetch('https://tdb.ridsport.se/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      console.error('TDB login failed:', loginResponse.status);
      throw new Error('Failed to login to TDB');
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('TDB login successful');

    // Fetch available competitions from TDB
    // Note: This searches through upcoming competitions, not just user's entries
    const competitionsResponse = await fetch('https://tdb.ridsport.se/api/v1/competitions', {
      headers: {
        'Cookie': cookies || '',
        'Accept': 'application/json',
      },
    });

    if (!competitionsResponse.ok) {
      console.error('Failed to fetch competitions:', competitionsResponse.status);
      return [];
    }

    const data = await competitionsResponse.json();
    console.log('Competitions data received from TDB');
    
    const competitions = data.competitions || data.data || [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Filter and format competitions
    const filteredCompetitions = competitions
      .filter((comp: any) => {
        const name = (comp.name || '').toLowerCase();
        const location = (comp.location || '').toLowerCase();
        const organizer = (comp.organizer || '').toLowerCase();
        
        return name.includes(lowerSearchTerm) || 
               location.includes(lowerSearchTerm) ||
               organizer.includes(lowerSearchTerm);
      })
      .map((comp: any) => ({
        tdb_id: comp.id?.toString(),
        name: comp.name || 'Okänd tävling',
        date: comp.date || comp.start_date,
        time: comp.time || comp.start_time,
        location: comp.location || comp.venue,
        discipline: comp.discipline || comp.sport || 'Okänd',
        organizer: comp.organizer || comp.club,
        phone: comp.phone || comp.contact_phone,
        email: comp.email || comp.contact_email,
        website: comp.website || comp.url,
        registration_deadline: comp.registration_deadline || comp.entry_deadline,
        classes: comp.classes || [],
      }))
      .slice(0, 10); // Limit to 10 results

    return filteredCompetitions;

  } catch (error) {
    console.error('Error searching TDB competitions:', error);
    return [];
  }
}
