<template>
  <div v-if="currentTutorial" class="edit-form">
    <h4>Edit Invoice</h4>
    <form>
      <div class="form-group">
        <label for="company">Company</label>
        <input type="text" class="form-control" id="company"
          v-model="currentTutorial.company"
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input type="text" class="form-control" id="description"
          v-model="currentTutorial.description"
        />
      </div>

      <div class="form-group">
        <label for="excelRecID">excelRecID</label>
        <input type="text" class="form-control" id="excelRecID"
          v-model="currentTutorial.excelRecID"
        />
      </div>

      <div class="form-group">
        <label><strong>Status:</strong></label>
        {{ currentTutorial.published ? "Published" : "Pending" }}
      </div>
    </form>

    <v-btn v-if=currentTutorial.published
                  @click="updatePublished(false)"> UnPublish </v-btn>
    <v-btn v-else @click="updatePublished(true)" > Publish   </v-btn>
    <v-btn        @click="deleteTutorial"        > Delete    </v-btn>
    <v-btn        @click="updateTutorial"        > Update    </v-btn>
    <p>{{ message }}</p>
  </div>
  <div v-else>
    <br />
    <p>Please click on a Tutorial...this message from Tutorial.vue unreachable</p>
  </div>
</template>

<script>
import InvoiceDataService from "../services/InvoiceDataService";

export default {
  name: "tutorial",
  data() {
    return {
      currentTutorial: null,
      message: ''
    };
  },
  methods: {
    getTutorial(id) {
      InvoiceDataService.get(id)
        .then(response => {
          this.currentTutorial = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    updatePublished(status) {
      var data = {
        id: this.currentTutorial.id,
        company: this.currentTutorial.company,
        description: this.currentTutorial.description,
        published: status
      };

      InvoiceDataService.update(this.currentTutorial.id, data)
        .then(response => {
          this.currentTutorial.published = status;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    updateTutorial() {
      InvoiceDataService.update(this.currentTutorial.id, this.currentTutorial)
        .then(response => {
          console.log(response.data);
          this.message = 'The tutorial was updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
    },

    deleteTutorial() {
      InvoiceDataService.delete(this.currentTutorial.id)
        .then(response => {
          console.log(response.data);
          this.$router.push({ name: "tutorials" });
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.message = '';
    this.getTutorial(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  max-width: 600px;
  margin: auto;
}
</style>