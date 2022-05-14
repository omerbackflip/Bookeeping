<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search in description field" v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>  -->
    <!-- <AddInvoice></AddInvoice> -->
    <v-layout row wrap>
      <v-flex xs12 md10>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search1"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <export-excel 
              :data="tutorials" 
              :fields="xlsHeders"
              type="xlsx"
              name="export"
              title="This is Title"
              footer="This is footer"
              class="mt-3">
              <v-btn class="btn btn-danger"> 
                <v-icon>mdi-download</v-icon>Download To Excel
              </v-btn>
            </export-excel>
          </v-col>
          <v-col cols="12" sm="6" md="3">
              <v-btn class="mt-3 btn btn-danger" @click="removeAllTutorials">
                Remove All
              </v-btn>
          </v-col>
        </v-row>
        <v-data-table :headers="headers" 
                      :items="tutorials" 
                      :search="search"
                      @click:row="rowClicked"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="75vh"
                      class="elevation-3"
                      :item-class="itemRowBackground"
                      loading = "isLoading"
                      loading-text="Loading... Please wait"
                      item-key="_id"
                      :show-expand="true"
                      :single-expand="true"
                      :expanded.sync="expanded">
                      <!-- @item-expanded="onExpand"> -->
          <template v-slot:[`item.actions`]="{ item }"> 
            <v-icon small @click="editOne(item._id)">mdi-pencil</v-icon>
            <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
          </template>
          <template v-slot:[`item.date`]="{ item }"> 
            <span> {{item.date | formatDate}}</span>
          </template>
          <template v-slot:[`item.total`]="{ item }"> 
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                  <span v-on="on"> {{item.total ? item.total.toLocaleString() : ''}}</span>
              </template>
              <span>{{item.pratim}} - {{Number(item.record_schum).toLocaleString()}} - {{item.cust_lname}}</span>
            </v-tooltip>
          </template>
          <template v-slot:[`item.vat`]="{ item }"> 
            <span> {{item.vat ? item.vat.toLocaleString() : ''}}</span>
          </template>
          <template v-slot:[`item.amount`]="{ item }"> 
            <span> {{item.amount ? item.amount.toLocaleString() : ''}}</span>
          </template>
          <template v-slot:[`item.published`]="{ item }"> 
            <v-checkbox v-model="item.published" @click="updateOne(item)"> </v-checkbox>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item._id}`"
                            @blur="updateOne(item)"/>
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{item.description}}</span>
            </div>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              {{item.pratim}} - {{item.record_schum}} - {{item.cust_lname}}
            </td>
          </template>
        </v-data-table>
        <v-footer color="primary lighten-1" align="center" elevation="10">
          <v-form ref="form" >
            <v-row>
              <v-col >
                <v-combobox
                  v-model="invoice.company"
                  :items="companyName"
                  label="Company"
                  dense
                ></v-combobox>
              </v-col>
              <v-col >
                <v-combobox
                  v-model="invoice.project"
                  :items="projectName"
                  label="Project"
                  dense
                ></v-combobox>
              </v-col>
              <v-col >
                <v-text-field v-model="invoice.description" label="Description" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="invoice.amount" label="Amount" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="invoice.vat" label="Vat"></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="invoice.year" label="Year"></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="invoice.total" label="Total" required></v-text-field>
              </v-col>              
              <v-col >
                <v-text-field v-model="invoice.group" label="Group" required></v-text-field>
              </v-col>
              <v-col >
                <v-dialog ref="dialog" :return-value.sync="invoice.date" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field 
                      v-model="invoice.date"
                      label="Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on" 
                      required>
                    </v-text-field>
                  </template> 
                  <v-date-picker v-model="invoice.date" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dialog=false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(invoice.date)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>
              <v-col >
                <v-combobox
                  v-model="invoice.supplier"
                  :items="supplierName"
                  label="Supplier"
                  dense
                ></v-combobox>
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
            <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
          </v-form>
        </v-footer>
      </v-flex>

      <!-- this section is the summary of the supplier -->
      <v-flex md2>
        <!-- <v-container class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <div class="col-md-12">
            <div v-if="corrolatedBook[0]">
              <h4 class="text-center"><strong><u>קליטה אצל רו"ח</u></strong></h4>
              <div>
                <label><strong>Company:</strong></label> {{ corrolatedBook[0].company }}
              </div>
              <div>
                <label><strong>asmchta_date:</strong></label> {{ corrolatedBook[0].asmchta_date }}
              </div>
              <div>
                <label><strong>record_id:</strong></label><strong class="red--text text--lighten-1"> {{ corrolatedBook[0].record_id }} </strong>
              </div>
              <div>
                <label><strong>record_schum:</strong></label> {{ corrolatedBook[0].record_schum }}
              </div>
              <div>
                <label><strong>pratim:</strong></label> {{ corrolatedBook[0].pratim }}
              </div>
              <div>
                <label><strong>asmacta1:</strong></label> {{ corrolatedBook[0].asmacta1 }}
              </div>
              <div>
                <label><strong>schum_hova:</strong></label> {{ corrolatedBook[0].schum_hova }}
              </div>
              <div>
                <label><strong>schum_zchut:</strong></label> {{ corrolatedBook[0].schum_zchut }}
              </div>
              <div>
                <label><strong>cust_lname:</strong></label> {{ corrolatedBook[0].cust_lname }}
              </div>
              <div>
                <label><strong>cust_fname:</strong></label> {{ corrolatedBook[0].cust_fname }}
              </div>
              <div>
                <label><strong>bs_item_name:</strong></label> {{ corrolatedBook[0].bs_item_name }}
              </div>
              <div>
                <label><strong>bs_group_name:</strong></label> {{ corrolatedBook[0].bs_group_name }}
              </div>
              <a :href="'/books/' + corrolatedBook[0].id">
                Edit the Invoice with excelRecID - {{corrolatedBook[0].record_id}}
              </a>
              {{corrolatedBook[0].id}}
            </div>
            <div v-else>
              <br />
              <p>Please click on an Invoice...</p>
            </div>
          </div>
        </v-container> -->
        <v-container v-if = "currInvoice" class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <h5 style="text-align:center">{{currInvoice.supplier}}   -   {{this.supplierTotal.toLocaleString()}}</h5>
          <v-data-table :headers="sideHeaders"
                        :items="supplierFilter" 
                        disable-pagination
                        hide-default-footer
                        fixed-header
                        class="elevation-3"
                        dense>
            <template v-slot:[`item.total`]="{ item }"> 
              <span> {{item.total ? item.total.toLocaleString() : ''}}</span>
            </template>
          </v-data-table>
        </v-container>
        <v-container v-if = "currInvoice" class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <h5 style="text-align:center">{{currInvoice.project}}   -   {{this.projectTotal.toLocaleString()}}</h5>
          <v-data-table :headers="sideHeaders"
                        :items="projectFilter" 
                        disable-pagination
                        hide-default-footer
                        fixed-header
                        class="elevation-3"
                        dense>
            <template v-slot:[`item.total`]="{ item }"> 
              <span> {{item.total ? item.total.toLocaleString() : ''}}</span>
            </template>
          </v-data-table>
        </v-container>
      </v-flex>
    </v-layout>
    
  </div>
</template>



<script>
import TutorialDataService from "../services/TutorialDataService";
// import BookDataService from "../services/BookDataService";
import TableDataService from "../services/TableDataService";
// import AddInvoice from "./AddInvoice.vue"
import Vue from 'vue'
import moment from 'moment'
import excel from 'vue-excel-export'
Vue.use(excel)

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
      companyName   : [],
      projectName   : [],
      supplierName  : [],
      expanded: [],
      supplierTotal : 0,
      supplierFilter: [],
      sideHeaders: [
        { text: "Total", value: "total", align:'right'},
        { text: "Description", value: "description", align:'right'},
      ],
      projectTotal : 0,
      projectFilter: [],
      //searchStr: "",
      search: '',
      headers:[
        { text: "^", value: "data-table-expand", class: 'success title', groupable: false },
        { text: "G", value: "group", class: 'success title' },
        { text: "Comp.", value: "company", class: 'success title', width: '4%'},
        { text: "Project", value: "project", class: 'success title' },
        { text: "Date", value: "date", class: 'success title', groupable: false  },
        { text: "Description", value: "description", class: 'success title', groupable: false, width: '7%' },
        { text: "Supplier", value: "supplier", class: 'success title' },
        { text: "Amount", value: "amount", class: 'success title', groupable: false, align:'right'  },
        { text: "Vat", value: "vat", class: 'success title', groupable: false, align:'right'  },
        { text: "Total", value: "total", class: 'success title', groupable: false, align:'right'  },
        { text: "Invoice ID", value: "invoiceId", class: 'success title', groupable: false  },
        { text: "Excel Rec ID", value: "excelRecID", class: 'success title', groupable: false, width: '4%'  },
        { text: "Remark", value: "remark", class: 'success title', groupable: false, width: '5%'  },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
        { text: "P", value: "published", class: 'success title', groupable: false  },
        //{ text: "Year", value: "year", class: 'success title'},
        //{ text: "Pratim", value: "pratim", sortable: false, class: 'success title', groupable: false  },
      ],
      xlsHeders:{
        "חברה"        :"company", 
        "פרויקט"      :"project", 
        "תאור"        :"description",
        "סכום"        :"amount",
        "מע-מ"        :"vat",
        "סה-כ"        :"total",
        "קיבוץ"       :"group",
        "תאריך"       :"date",
        "ספק"         :"supplier",
        "חשבונית"     :"invoiceId",
        "excelRecID"  :"excelRecID",
        "הערה"        :"remark",
        "נשלח"        :"published"
      },
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
        year:         null,
      },  
      fldRules: [v => !!v || 'Field is required'],
      isLoading: true,
      itemToEdit: "",
      corrolatedBook: "",
    };
  },

  methods: {
    rowClicked(row) {
      this.currInvoice = row;
      // this.corrolatedBook = '';
      // if (row.excelRecID) {
      //   BookDataService.findByRecord_id(row.excelRecID)
      //     .then((response) => {
      //       this.corrolatedBook = response.data;
      //       // console.log(this.corrolatedBook[0].record_schum);
      //     })
      //     .catch((e) => {
      //       console.log(e);
      //     });
      // }
      if(row.supplier){
        this.supplierFilter = this.tutorials.filter(supp => supp.supplier === row.supplier);
        //this.supplierTotal = this.supplierFilter.reduce(num1 => num1.total);
        this.supplierTotal = 0;
        for (let i=0; i< this.supplierFilter.length ;i++ ){
          this.supplierTotal += this.supplierFilter[i].total;
        }
        this.projectFilter = this.tutorials.filter(supp => supp.project === row.project);
        this.projectTotal = 0;
        for (let i=0; i< this.projectFilter.length ;i++ ){
          this.projectTotal += this.projectFilter[i].total;
        }
      }
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        TutorialDataService.delete(id)
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },


    retrieveTutorials() {
      TutorialDataService.getAll()
        .then((response) => {
          this.tutorials = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    loadRefTables() {
      TableDataService.findByTableID(1) // Retrive company array
        .then((response) => {
          this.companyName = response.data.map(company => company.description);
        })
        .catch((e) => {
          console.log(e);
        });

      TableDataService.findByTableID(2) // Retrive project array
        .then((response) => {
          this.projectName = response.data.map(project => project.description);
        })
        .catch((e) => {
          console.log(e);
        });

      TableDataService.findByTableID(3) // Retrive supplier array
        .then((response) => {
          this.supplierName = response.data.map(project => project.description);
        })
        .catch((e) => {
          console.log(e);
        });
    },


    loadTable:function async (table_id) {
      TableDataService.findByTableID(table_id)
        .then((response) => {
          return (response.data.map(code => code.description));
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTutorials();
      this.currInvoice = this.tutorials[0];
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

    searchSTR() {
      TutorialDataService.findByTitle(this.searchStr)
        .then((response) => {
          this.tutorials = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteItem(id) { //this function doesnt work.... check why 28.09.21
      const index = this.tutorial.indexOf((x) => x.id === id);
      this.tutorial.splice(index, 1);
    },

    saveInvoice() {
      TutorialDataService.create(this.invoice)
        .then(response => {
          this.invoice.id = response.data.id;
          this.refreshList();
          this.clearForm();
        })
        .catch(e => {
          console.log(e);
        });
    },

    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) { // this is example how to call to different page using router
      this.$router.push({ name: "tutorial-details", params: { id: id } });
    },

    editInvoice(item) {
        this.updateMode = true,
        this.invoice.company = item.company,
        this.invoice.description = item.description,
        this.invoice.amount = item.amount,
        this.invoice.vat = item.vat,
        this.invoice.total = item.total,
        this.invoice.group = item.group,
        this.invoice.date = item.date,
        this.invoice.supplier = item.supplier,
        this.invoice.invoiceId = item.invoiceId,
        this.invoice.remark = item.remark,
        this.invoice.excelRecID = item.excelRecID,
        this.invoice.published = item.published,
        this.invoice.project = item.project
    },

    updateOne(item) {
      TutorialDataService.update(item._id, item)
        .then(response => {
          console.log(response.data);
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

		//Background of row if added to Book table
		itemRowBackground(item) {
			return item.pratim ? 'bg-green' : '';
		},

    // onExpand() {
    //   console.log(this.expanded);
    // }

  },

  mounted() {
    this.retrieveTutorials();
    this.loadRefTables();
    // this.companyName = this.loadTable(1);
    // console.log(this.companyName)
    this.isLoading = false;
  },
};



</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
}

.bg-green{
	background-color: lightgreen !important;
}

</style>
