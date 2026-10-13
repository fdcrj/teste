const { google } = require("googleapis");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido. Use GET." });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!sheetId || !serviceAccountJson) {
    return res.status(500).json({ error: "Configure GOOGLE_SHEET_ID e GOOGLE_SERVICE_ACCOUNT_JSON no ambiente do servidor." });
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    const sheets = google.sheets({ version: "v4", auth });
    const [detail, summary] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "'ALL CERVEJAS'!A:J" }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "'Geral'!A:AC" })
    ]);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({
      detailGrid: detail.data.values || [],
      summaryGrid: summary.data.values || []
    });
  } catch (error) {
    console.error("Falha no proxy Google Sheets:", error.message);
    return res.status(502).json({ error: "Não foi possível ler a planilha. Verifique as credenciais e o compartilhamento com a conta de serviço." });
  }
};
