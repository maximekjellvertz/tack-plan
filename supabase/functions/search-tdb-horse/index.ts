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

    const { horseName, userId } = await req.json();
    
    if (!horseName || horseName.trim().length < 2) {
      return new Response(
        JSON.stringify({ horses: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching TDB for horse:', horseName);

    // Get user's TDB credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('tdb_credentials')
      .select('tdb_email, tdb_password_encrypted')
      .eq('user_id', userId)
      .single();

    if (credError || !credentials) {
      console.error('No TDB credentials found:', credError);
      return new Response(
        JSON.stringify({ horses: [], needsCredentials: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tdbPassword = atob(credentials.tdb_password_encrypted);
    const horses = await searchTDBHorses(credentials.tdb_email, tdbPassword, horseName);

    return new Response(
      JSON.stringify({ horses, needsCredentials: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching TDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, horses: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function searchTDBHorses(email: string, password: string, horseName: string) {
  try {
    // Login to TDB (same as sync-tdb-competitions)
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

    // Fetch user's entries (same endpoint as competitions sync)
    const entriesResponse = await fetch('https://tdb.ridsport.se/api/v1/entries', {
      headers: {
        'Cookie': cookies || '',
        'Accept': 'application/json',
      },
    });

    if (!entriesResponse.ok) {
      console.error('Failed to fetch entries:', entriesResponse.status);
      return [];
    }

    const data = await entriesResponse.json();
    console.log('Entries data received:', JSON.stringify(data).substring(0, 300));
    
    // Extract horses from entries
    const horses = new Map();
    const lowerSearchName = horseName.toLowerCase();
    const entries = data.entries || [];

    for (const entry of entries) {
      // Extract horse data from entry
      const horse = entry.horse || entry.horse_data || entry.horse_name;
      if (!horse) continue;
      
      // Handle both object and string formats
      const horseName = typeof horse === 'string' ? horse : horse.name;
      if (!horseName) continue;
      
      // Filter by search term
      if (!horseName.toLowerCase().includes(lowerSearchName)) continue;
      
      // Use horse name as key to avoid duplicates
      const key = horseName;
      if (horses.has(key)) continue;
      
      // Build horse object
      const horseData = typeof horse === 'object' ? horse : { name: horse };
      
      horses.set(key, {
        name: horseName,
        breed: horseData.breed || horseData.race || entry.breed || 'Okänd',
        age: calculateAge(horseData.birth_date || horseData.born || entry.horse_birth_date),
        birthDate: horseData.birth_date || horseData.born || entry.horse_birth_date,
        color: horseData.color || horseData.colour || entry.horse_color || 'Okänd',
        microchip: horseData.microchip || horseData.chip_number || entry.horse_microchip,
        registrationNumber: horseData.registration_number || horseData.reg_number || entry.horse_reg_number,
        gender: horseData.gender || horseData.sex || entry.horse_gender,
      });
    }

    return Array.from(horses.values());

  } catch (error) {
    console.error('Error searching TDB horses:', error);
    return [];
  }
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
