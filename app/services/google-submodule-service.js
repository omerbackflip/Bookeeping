const path = require('path');
const fs = require('fs');

const {
  createOAuthClient,
  createFileTokenStore,
  uploadFile
} = require('../../google/backend');

const tokenStore = createFileTokenStore(
  path.join(__dirname, '../config/token.json')
);

function getStoredTokens() {
  return tokenStore.load();
}

function hasStoredTokens() {
  return !!getStoredTokens();
}

function getOAuthClientFromStoredTokens() {
  const tokens = getStoredTokens();

  if (!tokens) {
    throw new Error('Google is not connected');
  }

  const oAuth2Client = createOAuthClient({
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VUE_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });

  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

function getMimeTypeByFileName(filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.xlsx') {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  if (ext === '.zip') {
    return 'application/zip';
  }

  if (ext === '.png') {
    return 'image/png';
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg';
  }

  if (ext === '.pdf') {
    return 'application/pdf';
  }

  return 'application/octet-stream';
}

async function uploadFileToDrive(filePath, folderId) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  if (!folderId) {
    throw new Error('folderId is required');
  }

  const oAuth2Client = getOAuthClientFromStoredTokens();
  const filename = path.basename(filePath);

  const file = await uploadFile({
    oAuth2Client,
    name: filename,
    mimeType: getMimeTypeByFileName(filename),
    body: fs.createReadStream(filePath),
    folderId
  });

  return file;
}

module.exports = {
  getStoredTokens,
  hasStoredTokens,
  getOAuthClientFromStoredTokens,
  uploadFileToDrive
};