<template>
  <div class="list row">
    <v-layout row wrap>
      <v-flex xs12 md6 mt-5>
        <v-data-table :headers="headers" 
                      :items="tableID"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="70vh"
                      @click:row="filterTbl"
                      dense
                      class="elevation-3"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:top>
            <v-toolbar>
              <v-row>
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="חיפוש"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              </v-toolbar>           
          </template>
          <template v-slot:[`item.actions`]="{ item }"> 
            <!-- <v-icon small @click="editOne(item._id)">mdi-pencil</v-icon> -->
            <div>
              <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
                {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
              </v-icon>
              <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.description}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_id"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.table_id}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_code"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.table_code}}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>

      <!-- SECOND TABLE -->
      <v-flex xs12 md6 mt-5>
        <v-data-table :headers="headers" 
                      :items="tableCode"
                      @click:row="showData"
                      disable-pagination
                      dense
                      :search="search"
                      hide-default-footer
                      fixed-header
                      height="70vh"
                      class="elevation-3"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:top>
            <v-toolbar>
              <v-row>
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="חיפוש"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="5">
                  <v-text-field v-model="tableTitle">  {{tableTitle}} </v-text-field>
                </v-col>
              </v-row>

              <export-excel
                :data="tables"
                type="xlsx"
                name="all-tables"
                title="All Tables"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>

            </v-toolbar>           
          </template>
          <template v-slot:[`item.actions`]="{ item }"> 
            <!-- <v-icon small @click="editOne(item._id)">mdi-pencil</v-icon> -->
            <div>
              <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
                {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
              </v-icon>
              <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.description}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_id"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.table_id}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_code"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div >
              <span> {{item.table_code}}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>

      <v-flex md10>
        <v-footer color="primary lighten-1" align="center" class="mt-2" elevation="10">
          <v-form ref="form" >
            <v-row>
              <v-col >
                <v-text-field v-model="tblFields.table_id" label="ID" :rules="fldRules"></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.table_code" label="Code" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.description" label="Description" required></v-text-field>
              </v-col>
            </v-row>
            <v-btn @click="addToTable"> -Add- </v-btn>
            <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
          </v-form>
        </v-footer>
      </v-flex>

      <v-dialog v-model="summaryDialog" max-width="1100px">
        <v-card>
          <v-flex>
            <v-data-table
              :headers="summaryHeaders"
              :items="summaryFilter"
              disable-pagination
              hide-default-footer
              fixed-header
              mobile-breakpoint="0"
              class="elevation-3 list"
              dense
              height="70vh">
              <template v-slot:top>
                <v-toolbar style="font-size: x-large;">
                  Total : {{ summaryTotal.toLocaleString() }}
                  <v-spacer></v-spacer>
                  {{ summaryHeader }}
                  <v-spacer></v-spacer>
                  Count : {{ summaryFilter.length }}
                </v-toolbar>
              </template>
              <template v-slot:[`item.asmchta_date`]="{ item }">
                <span style="margin-left: 0.5rem"> {{ item.asmchta_date | formatDate }}</span>
              </template>
              <template v-slot:[`item.record_schum`]="{ item }">
                <span> {{ item.record_schum.toLocaleString() }}</span>
              </template>            </v-data-table>
          </v-flex>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>



<script>
import { BOOKS_MODEL, TABLE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';
import excel from "vue-excel-export";
import Vue from "vue";
import moment from "moment";

Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
  name: "table-list",
  data() {
    return {
      tables: [],
      tableID: [],
      tableCode: [],
      tableTitle: '',
      search: '',
      headers:[
        { text: "ID", value: "table_id", class: 'success title'},
        { text: "CODE", value: "table_code", class: 'success title'},
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: true,
      itemToEdit: "",
      tblFields: {
        table_id:         "",
        table_code:       "",
        description:"",
      },
      fldRules: [v => !!v || 'Field is required'],
      summaryHeaders:[
        { text: "asmchta_date", value: "asmchta_date", class: 'success title'},
        { text: "company", value: "company", class: 'success title'},
        { text: "record_schum", value: "record_schum", class: 'success title'},
        { text: "year", value: "year", class: 'success title'},
      ],
			summaryDialog: false,
      summaryFilter:[],
      summaryHeader: '',
      summaryTotal: 0,
    };
  },

  methods: {
    retrieveTables() {
      apiService.getMany({model: TABLE_MODEL})
        .then((response) => {
          this.tables = response.data;
          this.tableID = response.data.filter(item => item.table_id === 99);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: TABLE_MODEL ,id})
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    refreshList() {
      this.retrieveTables();
    },

    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      apiService.update(item._id, item, {model: TABLE_MODEL})
        .then(response => {
          console.log(response.data);
          this.message = 'The updateOne() updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
        this.itemToEdit = '';
    },

    setEdit(item) {
      this.itemToEdit = item._id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item._id}`).focus()
      }, 1 );
    },

    addToTable() {
      // var data = {
      //   table_id:     this.tblFields.id,
      //   table_code:   this.tblFields.code,
      //   description:  this.tblFields.description,
      // };
      // apiService.create(data,{ model: TABLE_MODEL})
      apiService.create(this.tblFields,{ model: TABLE_MODEL})
        .then(response => {
          this.tblFields.id = response.data.id;
          this.refreshList();
          this.clearForm();
        })
        .catch(e => {
          console.log(e);
        });
    },

    filterTbl(row) {
      this.tableCode = this.tables.filter(item => item.table_id === row.table_code)
      this.tableTitle = row.description;
    },

    async showData (item) {
      let response = ''
      switch (item.table_id) {
        case 5 :
          response = await apiService.getMany({model:BOOKS_MODEL, asmacta1:item.table_code})
          break;

        case 6 :
          response = await apiService.getMany({model:BOOKS_MODEL, cust_lname:item.description})
          break;           
      }
      this.summaryFilter = response.data; 
      this.summaryTotal = this.summaryFilter.reduce((currentTotal, item) => {
        return (item.record_schum + currentTotal) },0);

      if (item.table_id === 5) {
        this.summaryTotal = this.summaryTotal/2
      }
      this.summaryHeader = item.description
      this.summaryDialog = true;
    }
  },

  computed: {

  },

  mounted() {
    this.retrieveTables();
  },
};



</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
}
.title {
border: 3px solid blue;
text-align: center;
font-weight: bold;
font-size: 16px;
}
</style>
