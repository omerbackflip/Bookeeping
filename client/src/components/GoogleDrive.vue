<template>
  <div>
    <span @click="openDrive">Open Drive</span>
  </div>
</template>

<script>
import { checkGoogleStatus } from "@/utils/commonService"; 
import axios from 'axios';

let gapi = window.gapi;

export default {
  data() {
    return {
      fileUrl: null,
      folderId: localStorage.getItem('folderId'),
      token: localStorage.getItem('googleAccessToken'),
      refreshToken: localStorage.getItem('googleRefreshToken'), // assuming the refresh token is saved
      developerKey: localStorage.getItem('developerKey')
    };
  },
  mounted() {
    this.loadPickerApi();
  },
  methods: {
    // Load the Google Picker API only once when the component is mounted
    loadPickerApi() {
      gapi.load('picker', { 'callback': this.createPicker });
    },

    openDrive() {
      this.createPicker();  // Open the picker directly
    },

    // Create the Google Picker with the access token
    async createPicker() {
      const token = this.token;  // Use the saved access token directly

      if (!token) {
        console.error('Access token is missing!');
        return;
      }

      try {
        const isTokenExpired = await this.checkTokenValidity(token);
        if (isTokenExpired) {
          console.log('Access token expired, attempting to refresh...');
          await this.refreshAccessToken();
        }

        this.buildPicker();

      } catch (error) {
        console.error('Error checking token validity:', error);
      }
    },

    async checkTokenValidity(token) {
      return true;
    },

    async refreshAccessToken() {
      try {
        await checkGoogleStatus();
        
        this.token = localStorage.getItem('googleAccessToken');

        // Retry opening the picker after refreshing the token
        this.buildPicker();
      } catch (error) {
        console.error('Error refreshing access token:', error);
      }
    },

    buildPicker() {
      const token = this.token;

      if (!token) {
        console.error('Access token is still missing!');
        return;
      }

      const picker = new google.picker.PickerBuilder()
        .addView(
          new google.picker.DocsView(google.picker.ViewId.DRIVE)
            .setParent(this.folderId) // Limit to the specified folder
            .setIncludeFolders(true) // Limit to the specified folder
        )
        .setOAuthToken(token)
        .setDeveloperKey(this.developerKey)
        .setCallback(this.pickerCallback)
        .build();

      
        picker.setVisible(true);
      
    },

    pickerCallback(data) {
      if (data.action === google.picker.Action.PICKED) {
        const fileId = data.docs[0].id;
        const token = localStorage.getItem('googleAccessToken');

        // Construct the file URL
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

        
      }
    },
  },
};
</script>
