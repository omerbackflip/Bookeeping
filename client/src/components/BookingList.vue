<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search..." v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>  
    <AddInvoice/> -->
    <v-layout row wrap>
      <v-flex xs12 md10>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="This is Boooking search........."
          single-line
          hide-details
        ></v-text-field>
        <v-data-table :headers="headers" 
                      :items="books" 
                      :search="search"
                      @click:row="rowClicked"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="75vh"
                      class="elevation-3"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:[`item.actions`]="{ item }"> 
            <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon>
            <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
          </template>
          <template v-slot:[`item.asmchta_date`]="{ item }"> 
            <span> {{item.asmchta_date}}</span>
            <!-- <span> {{item.asmchta_date | formatDate}}</span> -->
          </template>
          <template v-slot:[`item.record_schum`]="{ item }"> 
            <span> {{ item.record_schum ? item.record_schum.toLocaleString() : ''}}</span>
          </template>                
          <template v-slot:[`item.schum_hova`]="{ item }"> 
            <span> {{ item.schum_hova ? item.schum_hova.toLocaleString() : '' }}</span>
          </template>                
          <template v-slot:[`item.schum_zchut`]="{ item }"> 
            <span> {{ item.schum_zchut ? item.schum_zchut.toLocaleString() : '' }}</span>
          </template>        
        </v-data-table>

      </v-flex>

      <!-- this section is the detailes of an invoice -->
      <v-flex md2>
        <v-container class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <div class="col-md-12">
            <div v-if="currInvoice">
              <h4>פרטים</h4>
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
              <a :href="'/books/' + currInvoice.id">
                Edit the Invoice ID - {{currInvoice.invoiceId}}
              </a>
            </div>
            <div v-else>
              <br />
              <p>Please click on an Invoice...</p>
            </div>
          </div>
        </v-container>
        <v-btn class="m-3 btn btn-sm btn-danger" @click="removeAllBooks">
          Remove All books
        </v-btn>
      </v-flex>
    </v-layout>

  </div>
</template>



<script>
import BookDataService from "../services/BookDataService";
//import TutorialDataService from "../services/TutorialDataService";
// import AddInvoice from "./AddInvoice.vue"

import Vue from 'vue'
import moment from 'moment'


Vue.filter('formatDate', function(value) {
  if (value) {
    //return moment(String(value)).format('MM/DD/YYYY hh:mm')
    return moment(String(value)).format('DD/MM/YYYY')
  }
});

export default {
  // components: {AddInvoice},
  name: "booking-list",
  data() {
    return {
      books: [],
      currInvoice: null,
      currentIndex: -1,
      //searchStr: "",
      search: '',
      headers:[
        { text: "company", value: "company", class: 'primary title' },
        { text: "asmchta_date", value: "asmchta_date", class: 'primary title' },
        { text: "record_id", value: "record_id", class: 'primary title'},
        { text: "year", value: "year", class: 'primary title'},
        { text: "record_schum", value: "record_schum", class: 'primary title' },
        { text: "pratim", value: "pratim", class: 'primary title' },
        { text: "asmacta1", value: "asmacta1", class: 'primary title' },
        { text: "schum_hova", value: "schum_hova", class: 'primary title' },
        { text: "schum_zchut", value: "schum_zchut", class: 'primary title' },
        { text: "cust_lname", value: "cust_lname", class: 'primary title' },
        { text: "cust_fname", value: "cust_fname", class: 'primary title' },
        { text: "bs_item_name", value: "bs_item_name", class: 'primary title' },
        { text: "bs_group_name", value: "bs_group_name", class: 'primary title' },
        { text: "Act.", value: "actions", sortable: false, class: 'primary title' },
      ],
      book: {
        id:           null,
        asmchta_date: "",
        record_id: null,
        record_schum: null,
        pratim: "",
        asmacta1: null,
        schum_hova: null,
        schum_zchut: null,
        cust_lname: "",
        cust_fname: "",
        bs_item_name: "",
        bs_group_name: "",
      },  
      fldRules: [v => !!v || 'Field is required'],
      isLoading: true,
      selectedYear : 2022,
    };
  },

  methods: {
    rowClicked(row) {
      this.currInvoice = row;
      //this.currentIndex = index;
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        BookDataService.delete(id)
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },


    retrieveBooks() {
      // BookDataService.getAll()
      BookDataService.findByYear(this.selectedYear)
        .then((response) => {
          this.books = response.data;
          window.alert(response.data.length + " were loaded to the table")
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveBooks();
      this.currInvoice = null;
      this.currentIndex = -1;
    },

    setActiveTutorial(tutorial, index) {
      this.currInvoice = tutorial;
      this.currentIndex = index;
    },

    removeAllBooks() {
      if (window.confirm('Are you sure you want to delete all items ?')){
        BookDataService.deleteAll()
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },


    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) {
      this.$router.push({ name: "tutorial-details", params: { id: id } });
    },

  },

  mounted() {
    this.retrieveBooks();
    this.isLoading = false;
    this.$root.$on('yearChange',(year) => {
      this.selectedYear = year;
    });
  },

  watch : {
    selectedYear () {
      this.retrieveBooks();
    },
  }
};



</script>

<style>
.list {
  text-align: right;
  max-width: auto;
  margin: auto;
}
</style>
