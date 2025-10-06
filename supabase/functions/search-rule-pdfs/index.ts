import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { extractText } from "https://esm.sh/unpdf@0.12.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching PDFs for user:', user.id);

    // Fetch user's PDFs from database
    const { data: pdfs, error: dbError } = await supabase
      .from('rule_pdfs')
      .select('*')
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch PDFs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pdfs || pdfs.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: 'Du har inte laddat upp några regel-PDFer ännu. Ladda upp PDFer först för att kunna söka i dem.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${pdfs.length} PDFs`);

    // Download and extract text from PDFs
    let allPdfText = '';
    
    for (const pdf of pdfs) {
      try {
        console.log(`Downloading PDF: ${pdf.file_name}`);
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('rule-pdfs')
          .download(pdf.file_path);

        if (downloadError) {
          console.error(`Error downloading ${pdf.file_name}:`, downloadError);
          continue;
        }

        // Convert blob to ArrayBuffer
        const arrayBuffer = await fileData.arrayBuffer();
        
        // Parse PDF using unpdf
        console.log(`Extracting text from ${pdf.file_name}`);
        const { text } = await extractText(new Uint8Array(arrayBuffer));
        
        // Join text array if needed
        const extractedText = Array.isArray(text) ? text.join('\n') : text;
        
        allPdfText += `\n\n--- Från fil: ${pdf.file_name} (Kategori: ${pdf.category}) ---\n`;
        allPdfText += extractedText.substring(0, 50000); // Limit per PDF to avoid token limits
        
        console.log(`Extracted ${extractedText.length} characters from ${pdf.file_name}`);
        
      } catch (error) {
        console.error(`Error processing ${pdf.file_name}:`, error);
        // Add error details to help debug
        console.error('Error details:', error);
      }
    }

    if (!allPdfText.trim()) {
      return new Response(
        JSON.stringify({ 
          answer: 'Kunde inte extrahera text från dina PDFer. Kontrollera att filerna är giltiga PDF-dokument.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Total extracted text length:', allPdfText.length);

    // Call Lovable AI to answer the question
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Du är en expert på hästsportregler som hjälper användare att hitta information i deras regeldokument. Svara alltid på svenska. Ge tydliga och konkreta svar baserade på dokumenten. Om informationen inte finns i dokumenten, säg det tydligt. När du hittar relevant information, referera gärna till vilken fil den kommer ifrån.'
          },
          {
            role: 'user',
            content: `Här är innehållet från användarens regel-PDFer:\n\n${allPdfText}\n\nAnvändarens fråga: ${question}\n\nVänligen svara baserat på informationen i dokumenten ovan.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'För många förfrågningar. Vänligen försök igen senare.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI-tjänsten kräver betalning. Kontakta support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || 'Kunde inte generera ett svar.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ answer }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-rule-pdfs function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});