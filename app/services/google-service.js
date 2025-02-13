// looks that some tutorials can be found here... https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file

const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const { ServerApp } = require('../config/constants');
const { auth } = require('google-auth-library');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', 
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.profile'
];
const TOKEN_PATH = path.join(ServerApp.configFolderPath, 'token.json');


function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // 'online' (default) or 'offline' (gets refresh_token). IMPORTANT NOTE - The refresh_token is only returned on the first authorization.
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

exports.refreshAccessToken = async (oAuth2Client,refreshToken) => {
  try {
    
    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const response = await oAuth2Client.getAccessToken();
    
    if(response.token && response.res.data){
      this.storeToken(JSON.stringify(response.res.data));
    }
     // Save updated token
    console.log("Access token refreshed successfully!");
    return response.res.data;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
};

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

exports.uploadBackup2GDrive = async (oAuth2Client, filename) => {
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

exports.uploadInvoiceToGoogleDrive = async (oAuth2Client, filename, folderPath = null) => {
  
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
   
  let parentFolderId = ServerApp.google.storeInvoiceFolderIds; 
  parentFolderId = parentFolderId[0];
  //console.log(folderPath,parentFolderId[0]);
  if(folderPath){
    const folderParts = folderPath.split('/');
    for (const part of folderParts) {
      parentFolderId = await findOrCreateFolder(part, parentFolderId, drive);
      parentFolderId = parentFolderId;
    }
  }

  if(parentFolderId){

      const fileMetadata = {
        name: filename, 
        parents: [parentFolderId], 
      };
      const filePath = path.join(ServerApp.uploadFolderPath, filename);
      const media = {
        mimeType: 'application/octet-stream', 
        body: fs.createReadStream(filePath), 
      };

      try {
        // Upload file to Google Drive
        const file = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name',
          supportsAllDrives: true, 
        });

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone', 
          },
        });

        const readableUrl = `https://docs.google.com/file/d/${file.data.id}/preview?usp=drivesdk`;
        
        return { id: file.data.id, name: file.data.name, url: readableUrl };

    } catch (error) {
      console.error('Error uploading the file to Google Drive:', error);
      
    }
  }else{
    return false;
  }
};

async function findOrCreateFolder(folderName, parentFolderId, drive) {
  try {
    const trimmedFolderName = folderName.trim();

    // Construct the search query
    const searchQuery = `${parentFolderId ? `'${parentFolderId}' in parents and ` : ''}name = '${trimmedFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    // Search for the folder
    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files.length > 0) {
      // Folder exists, return its ID
      console.log(`Folder exists: ${trimmedFolderName} (ID: ${response.data.files[0].id})`);
      return response.data.files[0].id;
    }

    // Folder doesn't exist, create it
    console.log(`Folder not found. Creating folder: ${trimmedFolderName}`);
    const folderMetadata = {
      name: trimmedFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name',
      supportsAllDrives: true,
    });

    console.log(`Folder created: ${trimmedFolderName} (ID: ${folder.data.id})`);
    return folder.data.id;

  } catch (error) {
    console.error(`Error finding or creating folder '${folderName}':`, error.message);
    throw error;
  }
}
