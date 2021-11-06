<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search..." v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div> -->
    <AddInvoice></AddInvoice> 
    <div class=".d-flex">
      <h4>רשימת חשבוניות</h4>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-data-table :headers="headers" 
                    :items="tutorials" 
                    :search="search"
                    @click:row="rowClicked">
        <template v-slot:[`item.actions`]="{ item }"> 
          <v-icon @click="deleteOne(item.id)">mdi-delete</v-icon>
        </template>
        <template v-slot:[`item.date`]="{ item }"> 
          <span> {{item.date | formatDate}}</span>
        </template>
      </v-data-table>

      <v-btn class="m-3 btn btn-sm btn-danger" @click="removeAllTutorials">
        Remove All
      </v-btn>
    </div>

    <!-- this section is the detailes of an invoice -->
    <v-container class="grey lighten-2 mx-5">
      <div class="col-md-6">
        <div v-if="currInvoice">
          <h4>Tutorial</h4>
          <div>
            <label><strong>Company:</strong></label> {{ currInvoice.company }}
          </div>
          <div>
            <label><strong>Description:</strong></label>
            {{ currInvoice.description }}
          </div>
          <div>
            <label><strong>Status:</strong></label>
            {{ currInvoice.published ? "Published" : "Pending" }}
          </div>
          <a :href="'/tutorials/' + currInvoice.id">
            Edit the Invoice ID - {{currInvoice.invoiceId}}
          </a>
        </div>
        <div v-else>
          <br />
          <p>Please click on an Invoice...</p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
import AddInvoice from "./AddInvoice.vue"
import Vue from 'vue'
import moment from 'moment'


Vue.filter('formatDate', function(value) {
  if (value) {
    //return moment(String(value)).format('MM/DD/YYYY hh:mm')
    return moment(String(value)).format('DD/MM/YYYY')
  }
});

export default {
  components: {AddInvoice},
  name: "tutorials-list",
  data() {
    return {
      tutorials: [],
      currInvoice: null,
      currentIndex: -1,
      //searchStr: "",
      search: '',
      headers:[
        { text: "Company", value: "company", class: 'success title'},
        { text: "Project", value: "project", class: 'success title' },
        { text: "Description", value: "description", class: 'success title' },
        { text: "Published", value: "published", class: 'success title' },
        { text: "Amount", value: "amount", class: 'success title' },
        { text: "Vat", value: "vat", class: 'success title' },
        { text: "Total", value: "total", class: 'success title' },
        { text: "Group", value: "group", class: 'success title' },
        { text: "Date", value: "date", class: 'success title' },
        { text: "Supplier", value: "supplier", class: 'success title' },
        { text: "Invoice ID", value: "invoiceId", class: 'success title' },
        { text: "Excel Rec ID", value: "excelRecID", class: 'success title' },
        { text: "Renark", value: "remark", class: 'success title' },
        { text: "Actions", value: "actions", sortable: false, class: 'success title' },
      ],
    };
  },

  // computed: {
  //   headers() {
  //     return [
  //       { text: "Company", value: "company" },
  //       { text: "Project", value: "project" },
  //       { text: "Description", value: "description" },
  //       { text: "Published", value: "published" },
  //       { text: "Amount", value: "amount" },
  //       { text: "Vat", value: "vat" },
  //       { text: "Total", value: "total" },
  //       { text: "Group", value: "group" },
  //       { text: "Date", value: "date" },
  //       { text: "Supplier", value: "supplier" },
  //       { text: "Invoice ID", value: "invoiceId" },
  //       { text: "Actions", value: "actions", sortable: false },
  //     ];
  //   },
  // },

  methods: {
    rowClicked(row) {
      this.currInvoice = row;
      //this.currentIndex = index;
      //console.log("company = " + row.company);
    },

    deleteOne(id) {
      TutorialDataService.delete(id)
        .then((response) => {
          console.log(response.data);
          this.refreshList();
        })
        .catch((e) => {
          console.log(e);
        });
    },

    retrieveTutorials() {
      TutorialDataService.getAll()
        .then((response) => {
          this.tutorials = response.data;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTutorials();
      this.currInvoice = null;
      this.currentIndex = -1;
    },

    setActiveTutorial(tutorial, index) {
      this.currInvoice = tutorial;
      this.currentIndex = index;
    },

    removeAllTutorials() {
      if (window.confirm('Are you sure you want to delete all items ?')){
        TutorialDataService.deleteAll()
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    // searchSTR() {
    //   TutorialDataService.findByTitle(this.searchStr)
    //     .then((response) => {
    //       this.tutorials = response.data;
    //       console.log(response.data);
    //     })
    //     .catch((e) => {
    //       console.log(e);
    //     });
    // },

    deleteItem(id) {
      //this function doesnt work.... check why 28.09.21
      const index = this.tutorial.indexOf((x) => x.id === id);
      this.tutorial.splice(index, 1);
    },
  },

  mounted() {
    this.retrieveTutorials();
  },
};
</script>

<style>
.list {
  text-align: right;
  max-width: auto;
  margin: auto;
}
</style>
