const {google} = require('googleapis');
require('dotenv').config();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly'
];

function getOAuth2Client() {
  const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN} = process.env;
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('Missing CLIENT_ID, CLIENT_SECRET or REDIRECT_URI in environment');
  }
  const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  if (REFRESH_TOKEN) oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});
  return oAuth2Client;
}

function getAuthUrl() {
  const oAuth2Client = getOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

async function exchangeCode(code) {
  const oAuth2Client = getOAuth2Client();
  const {tokens} = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

async function fetchGmail(query = '') {
  const auth = getOAuth2Client();
  const gmail = google.gmail({version: 'v1', auth});
  const listRes = await gmail.users.messages.list({userId: 'me', q: query, maxResults: 20});
  const messages = listRes.data.messages || [];
  const out = [];
  for (const m of messages) {
    const msg = await gmail.users.messages.get({userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date']});
    out.push({id: m.id, threadId: m.threadId, snippet: msg.data.snippet, headers: msg.data.payload?.headers});
  }
  return out;
}

async function searchDocs(q = '') {
  const auth = getOAuth2Client();
  const drive = google.drive({version: 'v3', auth});
  const safeQ = q ? `fullText contains '${q.replace("'","\\'")}' and mimeType='application/vnd.google-apps.document'` : "mimeType='application/vnd.google-apps.document'";
  const res = await drive.files.list({q: safeQ, fields: 'files(id,name,webViewLink)', pageSize: 20});
  return res.data.files || [];
}

async function searchSheets(q = '') {
  const auth = getOAuth2Client();
  const drive = google.drive({version: 'v3', auth});
  const safeQ = q ? `fullText contains '${q.replace("'","\\'")}' and mimeType='application/vnd.google-apps.spreadsheet'` : "mimeType='application/vnd.google-apps.spreadsheet'";
  const res = await drive.files.list({q: safeQ, fields: 'files(id,name,webViewLink)', pageSize: 20});
  const files = res.data.files || [];
  const sheets = google.sheets({version: 'v4', auth});
  const out = [];
  for (const f of files) {
    try {
      const values = await sheets.spreadsheets.values.get({spreadsheetId: f.id, range: 'A1:Z20'});
      out.push({id: f.id, name: f.name, webViewLink: f.webViewLink, sample: values.data.values || []});
    } catch (e) {
      out.push({id: f.id, name: f.name, error: e.message});
    }
  }
  return out;
}

module.exports = {getOAuth2Client, getAuthUrl, exchangeCode, fetchGmail, searchDocs, searchSheets};
