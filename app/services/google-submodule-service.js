const path = require('path');

const {
  createFileTokenStore,
  createGoogleService
} = require('../../google/backend');

const tokenStore = createFileTokenStore(
  path.join(__dirname, '../config/token.json')
);

const googleService = createGoogleService({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  tokenStore
});

module.exports = {
  googleService,
  tokenStore,
  uploadFileToDrive: googleService.uploadFileToDrive,
  getStoredTokens: googleService.getStoredTokens,
  hasStoredTokens: googleService.hasStoredTokens,
  getOAuthClientFromStoredTokens: googleService.getOAuthClientFromStoredTokens
};
