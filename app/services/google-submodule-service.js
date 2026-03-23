const path = require('path');
const fs = require('fs');
const { ServerApp } = require('../config/constants');

const {
  createOAuthClient,
  createFileTokenStore,
  uploadFile
} = require('../../google/backend');

const tokenStore = createFileTokenStore(
  path.join(__dirname, '../config/token.json')
);

function getOAuthClientFromStoredTokens() {
  const oAuth2Client = createOAuthClient({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });

  const tokens = tokenStore.load();

  if (!tokens) {
    throw new Error('Google is not connected');
  }

  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function uploadBackupExcelToDrive(filename) {
  const filePath = path.join(ServerApp.uploadFolderPath, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file not found: ${filePath}`);
  }

  const oAuth2Client = getOAuthClientFromStoredTokens();

  const file = await uploadFile({
    oAuth2Client,
    name: filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream(filePath),
    folderId: ServerApp.google.invoiceFolderIds[0]
  });

  return file;
}

module.exports = {
  uploadBackupExcelToDrive
};