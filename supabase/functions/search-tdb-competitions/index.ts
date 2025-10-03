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
    // Use TDB's public search endpoint instead of requiring login
    console.log('Searching TDB public competitions for:', searchTerm);
    
    // Build search URL with parameters
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    const searchParams = new URLSearchParams({
      'search[classes][]': 'Meeting',
      'search[start_on]': today.toISOString().split('T')[0],
      'search[end_on]': oneYearFromNow.toISOString().split('T')[0],
      'search[horse_type_id]': '3', // Horses
      'search[only_published_and_not_approved_propositions]': 'false',
      'search[show_all_notes]': 'false',
    });
    
    const searchUrl = `https://tdb.ridsport.se/meeting/searches?${searchParams.toString()}`;
    
    console.log('Fetching from public TDB search');
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; HoofprintsApp/1.0)',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch TDB search:', response.status);
      return [];
    }

    const html = await response.text();
    console.log('Received HTML from TDB, parsing...');
    
    // Parse the HTML to extract competition data
    const competitions = parseCompetitionsFromHTML(html, searchTerm);
    
    return competitions;

  } catch (error) {
    console.error('Error searching TDB competitions:', error);
    return [];
  }
}

function parseCompetitionsFromHTML(html: string, searchTerm: string): any[] {
  const competitions: any[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  try {
    // Extract competition data from HTML using regex patterns
    // This is a simplified parser - may need adjustments based on actual HTML structure
    
    // Look for competition blocks in the HTML
    const competitionBlocks = html.split('<div class="meeting-card"');
    
    for (let i = 1; i < competitionBlocks.length; i++) {
      const block = competitionBlocks[i];
      
      // Extract name
      const nameMatch = block.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i);
      const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      
      // Extract date
      const dateMatch = block.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : '';
      
      // Extract location
      const locationMatch = block.match(/location[^>]*>([^<]+)</i);
      const location = locationMatch ? locationMatch[1].trim() : '';
      
      // Extract discipline
      const disciplineMatch = block.match(/discipline[^>]*>([^<]+)</i);
      const discipline = disciplineMatch ? disciplineMatch[1].trim() : '';
      
      // Extract organizer/club
      const organizerMatch = block.match(/club[^>]*>([^<]+)</i);
      const organizer = organizerMatch ? organizerMatch[1].trim() : '';
      
      // Filter by search term
      if (name && (
        name.toLowerCase().includes(lowerSearchTerm) ||
        location.toLowerCase().includes(lowerSearchTerm) ||
        organizer.toLowerCase().includes(lowerSearchTerm)
      )) {
        competitions.push({
          name: name,
          date: date,
          location: location,
          discipline: discipline || 'Okänd',
          organizer: organizer,
          time: '',
          phone: '',
          email: '',
          website: '',
          registration_deadline: null,
          classes: [],
        });
      }
      
      if (competitions.length >= 10) break;
    }
    
    console.log(`Found ${competitions.length} matching competitions`);
    return competitions;
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}

function formatCompetitions(comps: any[], searchTerm: string) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return comps
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
    .slice(0, 10);
}
