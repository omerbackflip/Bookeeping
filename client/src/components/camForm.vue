<template>
  <v-dialog v-model="dialogCamInternal">
    <v-card>
      <v-card-title>
        <div class="text-h5">Select File From</div>
        <v-spacer></v-spacer>
        <span small class="mx-3" @click="closeCam">X</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <video
              v-if="!imageData.image"
              ref="video"
              class="camera-stream"
              autoplay
              style="width: 100%; height: 500px;"
            ></video>
            <img
              v-if="imageData.image"
              :src="imageData.image"
              class="camera-stream"
              style="width: 100%; height: 500px;"
            />
            <div class="ui divider"></div>
            <v-row class="d-flex justify-content-center my-2">
              <v-col cols="6">
                <v-btn
                  class="camera-icon"
                  :color="imageData.image ? 'warning' : 'primary'"
                  @click="imageData.image ? retakeImage() : captureImage()"
                >
                  {{ imageData.image ? "Retake Picture" : "Take Picture" }}
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn class="camera-icon" @click="uploadFile" color="success">
                  Upload To Google Drive
                </v-btn>
              </v-col>
            </v-row>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import specificService from "@/services/specificServiceEndPoints";
import Vue from "vue";

export default {
  name: "cam-form",
  props: {
    invoice: {
      required: true,
    },
    dialogCam: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      dialogCamInternal: this.dialogCam, // Local copy of the dialog state
      mediaStream: null,
      imageData: {
        image: "",
        image_orientation: 0,
      },
    };
  },
  watch: {
    dialogCam: {
      immediate: true,
      handler(newVal) {
        if(newVal){
          this.dialogCamInternal = newVal;
          this.openCamera();
        }
      },
    },
    dialogCamInternal(newVal) {
      console.log(newVal);
      this.$emit("update:dialogCam", newVal); // Emit changes to parent
    },
  },
  methods: {
    openCamera() {
      this.dialogCamInternal = true;
      
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment"
          },
        })
        .then((mediaStream) => {
          this.$refs.video.srcObject = mediaStream;
          this.$refs.video.play();
          this.mediaStream = mediaStream;
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    },

    closeCam() {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      }
      this.imageData.image = null;
      this.dialogCamInternal = false;
    },
    captureImage() {
      if (!this.mediaStream) {
        alert("Camera not active. Please open the camera first.");
        return;
      }

      const mediaStreamTrack = this.mediaStream.getVideoTracks()[0];
      const imageCapture = new window.ImageCapture(mediaStreamTrack);

      imageCapture
        .takePhoto()
        .then((blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => {
            this.imageData.image = reader.result;
          };
        })
        .catch((error) => {
          console.error("Error capturing image:", error);
        });
    },
    retakeImage() {
      this.imageData.image = null;
      this.openCamera();
    },
    async uploadFile() {
      if (!this.imageData.image) {
        alert("No image available to upload");
        return;
      }

      const blob = await this.dataURLToBlob(this.imageData.image);
      const formData = new FormData();
      formData.append("file", blob, `image_${Date.now()}.png`);
      formData.append("group", this.invoice.group);

      try {
        const response = await specificService.uploadInvoiceToGoogleDrive(formData);
        if (response.data.success) {
          this.invoice.link = response.data.uploadedFile.id;
          this.closeCam();
          console.log("File uploaded successfully:", response.uploadedFile);
        } else {
          console.error("Error uploading file:", response.statusText);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    },
    async dataURLToBlob(dataURL) {
      const [header, base64] = dataURL.split(",");
      const binary = atob(base64);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], { type: "image/png" });
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
