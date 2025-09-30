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

    // Get all cookies from the response
    const setCookieHeaders = loginResponse.headers.get('set-cookie');
    console.log('TDB login successful, cookies received');

    // Parse cookies properly
    let cookieString = '';
    if (setCookieHeaders) {
      // Extract just the cookie values without attributes
      const cookies = setCookieHeaders.split(',').map(cookie => {
        const parts = cookie.trim().split(';');
        return parts[0];
      });
      cookieString = cookies.join('; ');
      console.log('Parsed cookies for requests');
    }

    // Try the horses search endpoint (gave 401 before, meaning it exists but needs proper auth)
    try {
      console.log('Trying /horses/search endpoint with proper cookies');
      const searchResponse = await fetch(
        `https://tdb.ridsport.se/horses/search?name=${encodeURIComponent(horseName)}`,
        {
          headers: {
            'Cookie': cookieString,
            'Accept': 'application/json, text/html',
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      console.log(`Search response status: ${searchResponse.status}`);
      
      if (searchResponse.ok) {
        const contentType = searchResponse.headers.get('content-type');
        console.log(`Response content-type: ${contentType}`);
        
        if (contentType?.includes('application/json')) {
          const data = await searchResponse.json();
          console.log('Search data received:', JSON.stringify(data).substring(0, 500));
          const horses = parseHorseData(data, horseName);
          if (horses.length > 0) {
            return horses;
          }
        } else {
          // HTML response - try to extract data
          const html = await searchResponse.text();
          console.log('HTML response received, length:', html.length);
        }
      }
    } catch (error) {
      console.error('Error with horses search:', error);
    }

    // Fallback: try to get user's entries
    try {
      console.log('Trying /api/v1/entries as fallback');
      const entriesResponse = await fetch('https://tdb.ridsport.se/api/v1/entries', {
        headers: {
          'Cookie': cookieString,
          'Accept': 'application/json',
        },
      });

      if (entriesResponse.ok) {
        const data = await entriesResponse.json();
        console.log('Entries data received:', JSON.stringify(data).substring(0, 300));
        return parseHorseData(data, horseName);
      }
    } catch (error) {
      console.error('Error with entries:', error);
    }

    return [];

  } catch (error) {
    console.error('Error searching TDB horses:', error);
    return [];
  }
}

function parseHorseData(data: any, searchName: string): any[] {
  const horses = new Map();
  const lowerSearchName = searchName.toLowerCase();

  // Try different possible data structures
  let horseList = [];
  
  if (data.horses) horseList = data.horses;
  else if (data.results) horseList = data.results;
  else if (data.data?.horses) horseList = data.data.horses;
  else if (data.data) horseList = Array.isArray(data.data) ? data.data : [data.data];
  else if (data.entries) {
    // Extract horses from entries
    for (const entry of data.entries) {
      const horse = entry.horse || entry.horse_data;
      if (horse) horseList.push(horse);
    }
  } else if (data.my_horses) horseList = data.my_horses;
  else if (Array.isArray(data)) horseList = data;

  for (const horse of horseList) {
    if (!horse || !horse.name) continue;
    
    const horseName = horse.name.toLowerCase();
    if (!horseName.includes(lowerSearchName)) continue;
    
    // Use horse ID or name as unique key to avoid duplicates
    const key = horse.id || horse.name;
    if (horses.has(key)) continue;
    
    horses.set(key, {
      name: horse.name || horse.horse_name,
      breed: horse.breed || horse.race || 'Okänd',
      age: calculateAge(horse.birth_date || horse.born || horse.birthDate),
      birthDate: horse.birth_date || horse.born || horse.birthDate,
      color: horse.color || horse.colour || 'Okänd',
      microchip: horse.microchip || horse.chip_number,
      registrationNumber: horse.registration_number || horse.reg_number || horse.fei_id,
      gender: horse.gender || horse.sex,
    });
  }

  return Array.from(horses.values());
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
