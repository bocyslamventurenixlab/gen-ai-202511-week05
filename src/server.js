const express = require('express');
const path = require('path');
const cors = require('cors');
const {getAuthUrl, exchangeCode, fetchGmail, searchDocs, searchSheets} = require('./googleClient');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/auth', (req, res) => {
  try {
    const url = getAuthUrl();
    res.redirect(url);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing `code` in query');
  try {
    const tokens = await exchangeCode(code);
    // Show the refresh token to the user so they can paste it into their .env
    res.send(`<pre>Save the refresh token into your .env as REFRESH_TOKEN=...\n\n${JSON.stringify(tokens, null, 2)}</pre>`);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.get('/api/gmail', async (req, res) => {
  const q = req.query.q || '';
  try {
    const data = await fetchGmail(q);
    res.json(data);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/docs', async (req, res) => {
  const q = req.query.q || '';
  try {
    const data = await searchDocs(q);
    res.json(data);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/sheets', async (req, res) => {
  const q = req.query.q || '';
  try {
    const data = await searchSheets(q);
    res.json(data);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
