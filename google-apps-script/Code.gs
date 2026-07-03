/**
 * Entri AI Career Advisor — Google Sheets lead capture
 *
 * SETUP:
 * 1. Create a new Google Sheet (e.g. "AI Career Advisor Leads")
 * 2. Extensions → Apps Script → paste this file → Save
 * 3. Run setupSheet() once from the editor (authorize when prompted)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into config.js → GOOGLE_SCRIPT_URL
 */

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Phone",
      "Language",
      "Goal",
      "Qualification",
      "Status",
      "Career Types",
      "Timeline",
      "Top Recommendations",
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) setupSheet();

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.phone || "",
      data.language || "",
      data.goal || "",
      data.qualification || "",
      data.status || "",
      data.careerType || "",
      data.timeline || "",
      data.recommendations || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Entri Career Advisor sheet endpoint" })
  ).setMimeType(ContentService.MimeType.JSON);
}
