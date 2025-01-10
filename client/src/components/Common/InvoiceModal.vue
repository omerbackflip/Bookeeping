<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <iframe :src="fileLink" frameborder="0" allowfullscreen></iframe>
        <button class="close-button" @click="close">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ModalDialog',
    data() {
      return {
        isOpen: false,
        fileLink: ''
      };
    },
    methods: {
      open(GDFileId) {
        // window.open(GDFileId, '_blank');  // this is open the invoice in a new tab
        this.fileLink = GDFileId;
        this.isOpen = true;
      },
      close() {
        this.isOpen = false;
        this.fileLink = '';
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* The z-index property only works if the element has a position value of relative, absolute, fixed, or sticky. */
  }
  
  .modal-content {
    width: 90%;
    height: 70%;
    background: white;
    position: relative;
    padding: 10px;
    border-radius: 5px;
    overflow: hidden;
    z-index: 1001;
  }
  
  iframe {
    width: 100%;
    height: 100%;
  }
  
  .close-button {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 5px 10px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 3px;
    z-index: 1002;
  }
  </style>
  