<template>
  <span>
    <v-btn
      x-small
      @click="openPicker"
      :disabled="isLoading"
      class="ml-1"
    >
      <v-icon x-small>mdi-google-drive</v-icon>
    </v-btn>
  </span>
</template>

<script>
import { pickGoogleDriveFile } from "../../../google/frontend";

export default {
  name: "GooglePicker",
  props: {
    folderId: {
      type: String,
      default: null,
    },
    includeFolders: {
      type: Boolean,
      default: true,
    },
    multiselect: {
      type: Boolean,
      default: false,
    },
    viewMimeTypes: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    async openPicker() {
      try {
        this.isLoading = true;

        const result = await pickGoogleDriveFile({
          folderId: this.folderId,
          includeFolders: this.includeFolders,
          multiselect: this.multiselect,
          viewMimeTypes: this.viewMimeTypes,
        });

        if (!result) return;

        this.$emit("picked", result);
      } catch (error) {
        console.error("Google Picker error:", error);
        alert("Error opening Google Picker.");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>