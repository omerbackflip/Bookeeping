<template>
  <div class="list row">
    <v-layout row wrap>
      <v-flex>
        <v-row>
          <v-col>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="This is Boooking search........."
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col>
            <v-btn class="m-3 btn btn-sm btn-danger" @click="removeAllBooks">
              Remove All books
            </v-btn>
          </v-col>
        </v-row>
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
    </v-layout>

  </div>
</template>



<script>
import BookDataService from "../services/BookDataService";

import Vue from 'vue'
import moment from 'moment'


Vue.filter('formatDate', function(value) {
  if (value) {
    //return moment(String(value)).format('MM/DD/YYYY hh:mm')
    return moment(String(value)).format('DD/MM/YYYY')
  }
});

export default {
  name: "booking-list",
  data() {
    return {
      books: [],
      currInvoice: null,
      currentIndex: -1,
      search: '',
      headers:[
        { text: "company", value: "company", class: 'primary title' },
        { text: "asmchta_date", value: "asmchta_date", class: 'primary title' },
        { text: "record_id", value: "record_id", class: 'primary title'},
        { text: "year", value: "year", class: 'success title'},
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
          window.alert(response.data.length + " records were retrieved from db")
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

    editOne(id) {
      this.$router.push({ name: "invoice-details", params: { id: id } });
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
