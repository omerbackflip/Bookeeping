<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search..." v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>  -->
    <!-- <AddInvoice></AddInvoice> -->
    <v-layout row wrap>
      <v-flex xs12 md10>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search1"
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
                      height="75vh"
                      class="elevation-3"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:[`item.actions`]="{ item }"> 
            <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon>
            <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
          </template>
          <template v-slot:[`item.date`]="{ item }"> 
            <span> {{item.date | formatDate}}</span>
          </template>
          <template v-slot:[`item.total`]="{ item }"> 
            <span> {{item.total ? item.total.toLocaleString() : ''}}</span>
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
            <div v-if = "itemToEdit === item.id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item.id}`"
                            @blur="updateOne(item)"/>
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{item.description}}</span>
            </div>
          </template>
        </v-data-table>

      </v-flex>

      <!-- this section is the detailes of an invoice -->
      <v-flex md2>
        <export-excel 
          :data="tutorials" 
          :fields="xlsHeders"
          type="xlsx"
          name="export"
          title="This is Title"
          footer="This is footer"
          class="mt-5">
          <v-btn> 
            <v-icon>mdi-download</v-icon> 
            Download To Excel
          </v-btn>
        </export-excel>
        <v-container class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <div class="col-md-12">
            <div v-if="CorrolatedBook[0]">
              <h4 class="text-center"><strong><u>קליטה אצל רו"ח</u></strong></h4>
              <div>
                <label><strong>Company:</strong></label> {{ CorrolatedBook[0].company }}
              </div>
              <div>
                <label><strong>asmchta_date:</strong></label> {{ CorrolatedBook[0].asmchta_date }}
              </div>
              <div>
                <label><strong>record_id:</strong></label><strong class="red--text text--lighten-1"> {{ CorrolatedBook[0].record_id }} </strong>
              </div>
              <div>
                <label><strong>record_schum:</strong></label> {{ CorrolatedBook[0].record_schum }}
              </div>
              <div>
                <label><strong>pratim:</strong></label> {{ CorrolatedBook[0].pratim }}
              </div>
              <div>
                <label><strong>asmacta1:</strong></label> {{ CorrolatedBook[0].asmacta1 }}
              </div>
              <div>
                <label><strong>schum_hova:</strong></label> {{ CorrolatedBook[0].schum_hova }}
              </div>
              <div>
                <label><strong>schum_zchut:</strong></label> {{ CorrolatedBook[0].schum_zchut }}
              </div>
              <div>
                <label><strong>cust_lname:</strong></label> {{ CorrolatedBook[0].cust_lname }}
              </div>
              <div>
                <label><strong>cust_fname:</strong></label> {{ CorrolatedBook[0].cust_fname }}
              </div>
              <div>
                <label><strong>bs_item_name:</strong></label> {{ CorrolatedBook[0].bs_item_name }}
              </div>
              <div>
                <label><strong>bs_group_name:</strong></label> {{ CorrolatedBook[0].bs_group_name }}
              </div>
              <a :href="'/books/' + CorrolatedBook[0].id">
                Edit the Invoice with excelRecID - {{CorrolatedBook[0].record_id}}
              </a>
              {{CorrolatedBook[0].id}}
            </div>
            <div v-else>
              <br />
              <p>Please click on an Invoice...</p>
            </div>
          </div>
        </v-container>
        <v-btn class="m-3 btn btn-sm btn-danger" @click="removeAllTutorials">
          Remove All
        </v-btn>
      </v-flex>
    </v-layout>
    <v-flex md10>
      <v-footer color="primary lighten-1" align="center" class="mt-5"  elevation="10">
        <v-form ref="form" >
          <v-row>
            <v-col >
              <!-- <v-text-field v-model="invoice.company" label="Company" :rules="fldRules"></v-text-field> -->
              <v-combobox
                v-model="invoice.company"
                :items="companyName"
                label="Company"
                outlined
                dense
              ></v-combobox>
            </v-col>
            <v-col >
              <!-- <v-text-field v-model="invoice.project" label="Project" required></v-text-field> -->
              <v-combobox
                v-model="invoice.project"
                :items="projectName"
                label="Project"
                outlined
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
              <!-- <v-text-field v-model="invoice.supplier" label="Supplier"></v-text-field> -->
              <v-combobox
                v-model="invoice.supplier"
                :items="supplierName"
                label="Supplier"
                outlined
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
  </div>
</template>



<script>
import TutorialDataService from "../services/TutorialDataService";
import BookDataService from "../services/BookDataService";
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
      companyName : [],
      projectName : [],
      supplierName: [],
      //searchStr: "",
      search: '',
      headers:[
        { text: "P", value: "published", class: 'success title', groupable: false  },
        { text: "Company", value: "company", class: 'success title'},
        { text: "Project", value: "project", class: 'success title' },
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "Amount", value: "amount", class: 'success title', groupable: false  },
        { text: "Vat", value: "vat", class: 'success title', groupable: false  },
        { text: "Total", value: "total", class: 'success title', groupable: false  },
        { text: "Group", value: "group", class: 'success title' },
        { text: "Date", value: "date", class: 'success title', groupable: false  },
        { text: "Supplier", value: "supplier", class: 'success title' },
        { text: "Invoice ID", value: "invoiceId", class: 'success title', groupable: false  },
        { text: "Excel Rec ID", value: "excelRecID", class: 'success title', groupable: false  },
        { text: "Remark", value: "remark", class: 'success title', groupable: false  },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      xlsHeders:{
        "חברה"        : "company", 
        "פרויקט"      : "project", 
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
        "נשלח"        : "published"
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
      },  
      fldRules: [v => !!v || 'Field is required'],
      isLoading: true,
      itemToEdit: "",
      CorrolatedBook: "",
    };
  },

  methods: {
    rowClicked(row) {
      if (row.excelRecID) {
        this.currInvoice = row;
        BookDataService.findByRecord_id(row.excelRecID)
          .then((response) => {
            this.CorrolatedBook = response.data;
            // console.log(this.CorrolatedBook[0].record_schum);
          })
          .catch((e) => {
            console.log(e);
          });
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
          //console.log(response.data);
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

    deleteItem(id) { //this function doesnt work.... check why 28.09.21
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
          this.refreshList();
          this.clearForm();
        })
        .catch(e => {
          console.log(e);
        });
      //this.dialog = false;
    },

    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) {
      this.$router.push({ name: "tutorial-details", params: { id: id } });
    },

    updateOne(item) {
      TutorialDataService.update(item.id, item)
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
      this.itemToEdit = item.id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item.id}`).focus()
      }, 1 );
    },

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
</style>
