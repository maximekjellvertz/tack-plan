import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthLog {
  id: string;
  horse_name: string;
  event: string;
  status: string;
  treatment: string;
  notes: string;
  severity: string;
  created_at: string;
  created_by_name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Ej autentiserad");
    }

    const { horseId } = await req.json();

    // Fetch health logs
    const { data: logs, error: logsError } = await supabase
      .from("health_logs")
      .select("*")
      .eq("horse_id", horseId)
      .order("created_at", { ascending: false });

    if (logsError) throw logsError;

    // Create simple HTML for PDF (browsers can print to PDF)
    const html = generateHealthReportHTML(logs as HealthLog[]);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in export-health-pdf:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateHealthReportHTML(logs: HealthLog[]): string {
  const horseName = logs[0]?.horse_name || "Okänd häst";
  const today = new Date().toLocaleDateString("sv-SE");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hälsorapport - ${horseName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .info { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .severity-high { color: #dc2626; font-weight: bold; }
        .severity-medium { color: #ea580c; }
        .severity-low { color: #16a34a; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>Hälsorapport</h1>
      <div class="info">
        <p><strong>Häst:</strong> ${horseName}</p>
        <p><strong>Rapportdatum:</strong> ${today}</p>
        <p><strong>Antal händelser:</strong> ${logs.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Händelse</th>
            <th>Allvarlighetsgrad</th>
            <th>Status</th>
            <th>Behandling</th>
            <th>Anteckningar</th>
            <th>Registrerad av</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td>${new Date(log.created_at).toLocaleDateString("sv-SE")}</td>
              <td>${log.event}</td>
              <td class="severity-${log.severity}">${
                log.severity === 'high' ? 'Hög' :
                log.severity === 'medium' ? 'Medel' : 'Låg'
              }</td>
              <td>${log.status}</td>
              <td>${log.treatment}</td>
              <td>${log.notes || '-'}</td>
              <td>${log.created_by_name || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <script>
        window.onload = () => window.print();
      </script>
    </body>
    </html>
  `;
}