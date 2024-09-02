// looks that some tutorials can be found here... https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file

const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const { ServerApp } = require('../config/constants');
const { auth } = require('google-auth-library');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', 
  // 'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.file',,
  // 'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/userinfo.profile'
];
const TOKEN_PATH = path.join(ServerApp.configFolderPath, 'token.json');


function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token). IMPORTANT NOTE - The refresh_token is only returned on the first authorization.
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  return authUrl;
}


exports.getAuthClient = () => {
  const credentials = JSON.parse(fs.readFileSync(ServerApp.configFolderPath + 'google-credentials.json'));
  
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  return oAuth2Client;
}

exports.getAuth = () => {

  const oAuth2Client = this.getAuthClient();

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  return getNewToken(oAuth2Client);
}

exports.getToken = async (oAuth2Client, code) => {
  
  const {tokens} = await oAuth2Client.getToken(code)

  if(tokens && tokens.access_token){
    this.storeToken(JSON.stringify(tokens));
    return tokens;
  }

  return false;
}

exports.storeToken = async (token) => {
  try{
    fs.writeFileSync(TOKEN_PATH,token);
  }catch (error){
    console.log("Error! While storing google token", error);
  }
}

exports.getUser = async (oAuth2Client) => {
  try{
    const oauth2 = google.oauth2({
        auth: oAuth2Client,
        version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();

    return userInfo.data;

  } catch (error) {
    console.log(error);
    return false;
  }
}

exports.uploadToGoogleDrive = async (oAuth2Client, filename) => {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); // auth object was "require" above...

  const filePath = path.join(ServerApp.uploadFolderPath, filename);
  const fileMetadata = {
    name: filename,
    parents: ServerApp.google.invoiceFolderIds,
  };
  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true,
    });
    
    // console.log('file.data', file.data);
    // console.log('file', file);

    return file.data;
  } catch (error) {
    console.error('Error uploading the file to google drive:', error);
    return false;
  }
}