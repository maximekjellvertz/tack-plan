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

    // Try to fetch user's entries which contain horse information
    const entriesResponse = await fetch('https://tdb.ridsport.se/api/v1/entries', {
      headers: {
        'Cookie': cookies || '',
        'Accept': 'application/json',
      },
    });

    if (!entriesResponse.ok) {
      console.error('Failed to fetch entries:', entriesResponse.status);
      // Try alternative endpoint - user profile/horses
      const profileResponse = await fetch('https://tdb.ridsport.se/api/v1/user/horses', {
        headers: {
          'Cookie': cookies || '',
          'Accept': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        console.error('Failed to fetch profile horses:', profileResponse.status);
        return [];
      }

      const profileData = await profileResponse.json();
      console.log('Profile data received:', JSON.stringify(profileData).substring(0, 300));
      return parseHorsesFromProfile(profileData, horseName);
    }

    const entriesData = await entriesResponse.json();
    console.log('Entries data received:', JSON.stringify(entriesData).substring(0, 300));
    
    return parseHorsesFromEntries(entriesData, horseName);

  } catch (error) {
    console.error('Error searching TDB horses:', error);
    return [];
  }
}

function parseHorsesFromEntries(data: any, searchName: string): any[] {
  const horses = new Map();
  const lowerSearchName = searchName.toLowerCase();

  // Extract horses from entries
  const entries = data.entries || data.data || [];
  
  for (const entry of entries) {
    const horse = entry.horse || entry.horse_data;
    if (!horse || !horse.name) continue;
    
    const horseName = horse.name.toLowerCase();
    if (!horseName.includes(lowerSearchName)) continue;
    
    // Use horse ID or name as unique key
    const key = horse.id || horse.name;
    if (horses.has(key)) continue;
    
    horses.set(key, {
      name: horse.name,
      breed: horse.breed || horse.race || 'Okänd',
      age: calculateAge(horse.birth_date || horse.born),
      birthDate: horse.birth_date || horse.born,
      color: horse.color || horse.colour || 'Okänd',
      microchip: horse.microchip || horse.chip_number,
      registrationNumber: horse.registration_number || horse.reg_number || horse.fei_id,
      gender: horse.gender || horse.sex,
    });
  }

  return Array.from(horses.values());
}

function parseHorsesFromProfile(data: any, searchName: string): any[] {
  const horses = [];
  const lowerSearchName = searchName.toLowerCase();

  const userHorses = data.horses || data.my_horses || [];
  
  for (const horse of userHorses) {
    if (!horse.name) continue;
    
    const horseName = horse.name.toLowerCase();
    if (!horseName.includes(lowerSearchName)) continue;
    
    horses.push({
      name: horse.name,
      breed: horse.breed || horse.race || 'Okänd',
      age: calculateAge(horse.birth_date || horse.born),
      birthDate: horse.birth_date || horse.born,
      color: horse.color || horse.colour || 'Okänd',
      microchip: horse.microchip || horse.chip_number,
      registrationNumber: horse.registration_number || horse.reg_number || horse.fei_id,
      gender: horse.gender || horse.sex,
    });
  }

  return horses;
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
