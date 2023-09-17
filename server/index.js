const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:8080/auth/callback';

const app = express();
const port = 8080;

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;

    const accessToken = await getAccessToken(code);
    res.redirect(`http://localhost:5173/?access_token=${accessToken}`);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).send('Error handling OAuth callback');
  }
});

const getAccessToken = async (code) => {
  const tokenResponse = await axios.post('https://accounts.google.com/o/oauth2/token', {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  if (!tokenResponse.data.access_token) {
    throw new Error('Failed to obtain access token');
  }
  return tokenResponse.data.access_token;
};

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
