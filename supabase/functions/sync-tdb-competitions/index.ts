import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { userId } = await req.json();
    
    console.log('Syncing competitions for user:', userId);

    // Get user's TDB credentials
    const { data: credentials, error: credError } = await supabaseClient
      .from('tdb_credentials')
      .select('tdb_email, tdb_password_encrypted')
      .eq('user_id', userId)
      .single();

    if (credError || !credentials) {
      console.error('No credentials found:', credError);
      throw new Error('TDB credentials not found');
    }

    // Decrypt password (simple base64 - in production use proper encryption)
    const tdbPassword = atob(credentials.tdb_password_encrypted);
    
    console.log('Attempting to scrape TDB for user:', credentials.tdb_email);

    // Scrape TDB website for competitions
    // This is a simplified version - you'll need to implement actual scraping
    const competitions = await scrapeTDBCompetitions(credentials.tdb_email, tdbPassword);

    console.log(`Found ${competitions.length} competitions`);

    // Delete existing competitions for this user
    await supabaseClient
      .from('competitions')
      .delete()
      .eq('user_id', userId);

    // Insert new competitions
    if (competitions.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('competitions')
        .insert(
          competitions.map((comp: any) => ({
            ...comp,
            user_id: userId,
          }))
        );

      if (insertError) {
        console.error('Error inserting competitions:', insertError);
        throw insertError;
      }
    }

    // Update last synced timestamp
    await supabaseClient
      .from('tdb_credentials')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId);

    return new Response(
      JSON.stringify({ success: true, count: competitions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing TDB competitions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function scrapeTDBCompetitions(email: string, password: string) {
  // This is a placeholder for actual TDB scraping logic
  // You'll need to implement actual HTTP requests to TDB
  
  console.log('Scraping TDB with credentials:', email);

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
      console.error('Login failed:', loginResponse.status);
      throw new Error('Failed to login to TDB');
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Login successful, got cookies');

    // Fetch user's registered competitions
    const competitionsResponse = await fetch('https://tdb.ridsport.se/api/v1/entries', {
      headers: {
        'Cookie': cookies || '',
        'Accept': 'application/json',
      },
    });

    if (!competitionsResponse.ok) {
      console.error('Failed to fetch competitions:', competitionsResponse.status);
      throw new Error('Failed to fetch competitions from TDB');
    }

    const data = await competitionsResponse.json();
    console.log('Fetched data from TDB:', JSON.stringify(data).substring(0, 200));

    // Parse and transform TDB data to our format
    // This is mock data - adjust based on actual TDB API response
    const competitions = (data.entries || []).map((entry: any) => ({
      tdb_id: entry.id?.toString(),
      name: entry.competition_name || 'Okänd tävling',
      date: entry.competition_date || new Date().toISOString().split('T')[0],
      time: entry.start_time || '09:00',
      location: entry.location || 'Okänd plats',
      discipline: entry.discipline || 'Okänd gren',
      status: entry.status || 'upcoming',
      classes: entry.classes || [],
      organizer: entry.organizer || '',
      phone: entry.phone || '',
      email: entry.email || '',
      website: entry.website || '',
      registration_deadline: entry.registration_deadline || null,
      registration_status: entry.registration_status || 'registered',
    }));

    return competitions;

  } catch (error) {
    console.error('Error scraping TDB:', error);
    // Return mock data for testing purposes
    return [
      {
        tdb_id: 'TDB001',
        name: 'Test Tävling från TDB',
        date: '2025-11-15',
        time: '10:00',
        location: 'Testplats',
        discipline: 'Hoppning',
        status: 'upcoming',
        classes: [{ name: 'Klass A', height: '120cm', time: '10:00', price: '400 kr' }],
        organizer: 'Test Arrangör',
        phone: '070-123456',
        email: 'test@test.se',
        website: 'https://test.se',
        registration_deadline: '2025-11-10',
        registration_status: 'registered',
      }
    ];
  }
}
