<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search..." v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>
    <AddInvoice></AddInvoice>  -->
    <v-layout row wrap>

      <v-flex xs12 md10>
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
                      @click:row="rowClicked"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="60vh">
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
      </v-flex>


      <!-- this section is the detailes of an invoice -->
      <v-flex xs12 md2>
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
      </v-flex>
    </v-layout>
    <v-footer color="primary lighten-1" align="center">

        <v-row>
          <v-col >
            <v-text-field v-model="invoice.company" label="Company"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.project" label="Project"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.description" label="Description"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.amount" label="Amount"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.vat" label="Vat"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.total" label="Total"></v-text-field>
          </v-col>              
          <v-col >
            <v-text-field v-model="invoice.group" label="Group"></v-text-field>
          </v-col>
          <v-col >
            <!-- <v-dialog ref="dialog" v-model="modal" :return-value.sync="invoice.date" persistent width="290px"> -->
            <v-dialog ref="dialog" :return-value.sync="invoice.date" persistent width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field 
                  v-model="invoice.date"
                  label="Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on" >
                </v-text-field>
              </template> 
              <v-date-picker v-model="invoice.date" scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modal = false">Cancel</v-btn>
                <v-btn text color="primary" @click="$refs.dialog.save(invoice.date)">OK</v-btn>
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.supplier" label="Supplier"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.invoiceId" label="Invouce Id"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.excelRecID" label="ExcelRecID"></v-text-field>
          </v-col>
          <v-col >
            <v-text-field v-model="invoice.remark" label="Remark"></v-text-field>
          </v-col> 

        </v-row>
        <v-btn @click="saveInvoice"> -Add- </v-btn>
        <v-btn class="mx-3">Clear</v-btn>

    </v-footer>
  </div>

</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
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
  name: "tutorials-list",
  data() {
    return {
      tutorials: [],
      currInvoice: null,
      currentIndex: -1,
      //searchStr: "",
      search: '',
      headers:[
        { text: "P", value: "published", class: 'success title' },
        { text: "Company", value: "company", class: 'success title'},
        { text: "Project", value: "project", class: 'success title' },
        { text: "Description", value: "description", class: 'success title' },
        { text: "Amount", value: "amount", class: 'success title' },
        { text: "Vat", value: "vat", class: 'success title' },
        { text: "Total", value: "total", class: 'success title' },
        { text: "Group", value: "group", class: 'success title' },
        { text: "Date", value: "date", class: 'success title' },
        { text: "Supplier", value: "supplier", class: 'success title' },
        { text: "Invoice ID", value: "invoiceId", class: 'success title' },
        { text: "Excel Rec ID", value: "excelRecID", class: 'success title' },
        { text: "Remark", value: "remark", class: 'success title' },
        { text: "Act.", value: "actions", sortable: false, class: 'success title' },
      ],
      invoice: {
        id:           null,
        company:      "",
        project:      "",
        description:  "",
        published:    false,
        amount:       null,
        vat:          null,
        total:        null,
        group:        "",
        date:         null,
        supplier:     "",
        invoiceId:    "",
        remark:       "",
        excelRecID:   null,
      },  

    };
  },

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

    saveInvoice() {
      var data = {
        company:      this.invoice.company,
        description:  this.invoice.description,
        amount:       this.invoice.amount,
        vat:          this.invoice.vat,
        total:        this.invoice.total,
        group:        this.invoice.group,
        date:         this.invoice.date,
        supplier:     this.invoice.supplier,
        invoiceId:    this.invoice.invoiceId,
        remark:       this.invoice.remark,
        excelRecID:   this.invoice.excelRecID,
        published:    this.invoice.published,
        project:      this.invoice.project,
      };
      TutorialDataService.create(data)
        .then(response => {
          this.invoice.id = response.data.id;
          //console.log(response.data);
          // this.submitted = true;
        })
        .catch(e => {
          console.log(e);
        });
      this.dialog = false;
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
