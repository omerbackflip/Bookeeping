<template>
  <div v-if="currentInvoice" class="edit-form">
    <h4>Edit Invoice</h4>
    <form>
      <div class="form-group">
        <label for="company">Company</label>
        <input type="text" class="form-control" id="company"
          v-model="currentInvoice.company"
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <input type="text" class="form-control" id="description"
          v-model="currentInvoice.description"
        />
      </div>

      <div class="form-group">
        <label for="excelRecID">excelRecID</label>
        <input type="text" class="form-control" id="excelRecID"
          v-model="currentInvoice.excelRecID"
        />
      </div>

      <div class="form-group">
        <label><strong>Status:</strong></label>
        {{ currentInvoice.published ? "Published" : "Pending" }}
      </div>
    </form>

    <v-btn v-if=currentInvoice.published
                  @click="updatePublished(false)"> UnPublish </v-btn>
    <v-btn v-else @click="updatePublished(true)" > Publish   </v-btn>
    <v-btn        @click="deleteInvoice"        > Delete    </v-btn>
    <v-btn        @click="updateInvoice"        > Update    </v-btn>
    <p>{{ message }}</p>
  </div>
  <div v-else>
    <br />
    <p>Please click on an Invoice...this message from Invoice.vue unreachable</p>
  </div>
</template>

<script>
import { INVOICE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';

export default {
  name: "invoice",
  data() {
    return {
      currentInvoice: null,
      message: ''
    };
  },
  methods: {
    getInvoice(id) {
      apiService.getById({model: INVOICE_MODEL,id})
        .then(response => {
          this.currentInvoice = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    updatePublished(status) {
      var data = {
        id: this.currentInvoice.id,
        company: this.currentInvoice.company,
        description: this.currentInvoice.description,
        published: status
      };

      apiService.update(this.currentInvoice.id, data,{model: INVOICE_MODEL})
        .then(response => {
          this.currentInvoice.published = status;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },

    updateInvoice() {
      apiService.update(this.currentInvoice.id, this.currentInvoice, {model: INVOICE_MODEL})
        .then(response => {
          console.log(response.data);
          this.message = 'The invoice was updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
    },

    deleteInvoice() {
      apiService.delete({id:this.currentInvoice.id, model: INVOICE_MODEL})
        .then(response => {
          console.log(response.data);
          this.$router.push({ name: "invoices" });
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.message = '';
    this.getInvoice(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  max-width: 600px;
  margin: auto;
}
</style>