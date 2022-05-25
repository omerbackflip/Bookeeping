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
          <v-col cols="12" sm="6" md="3">
              <v-select class="mt-3"
                :items="yearList"
                v-model="selectedYear"
                dense
                solo
            ></v-select>
          </v-col>
        </v-row>
        <v-data-table 
            :headers="headers"
            :items="tutorialsLimited" 
            :search="search"
            @click:row="rowClicked"
            @scroll.native="onScroll"
            id="virtual-scroll-table"
            disable-pagination
            hide-default-footer
            fixed-header
            class="elevation-3"
            :item-class="itemRowBackground"
            loading = "isLoading"
            loading-text="Loading... Please wait"
            item-key="_id"
            :show-expand="true"
            :single-expand="true"
            :expanded.sync="expanded"
          >
          <template v-if="start > 0" v-slot:body.prepend>
              <tr>
                <td :colspan="headers.length" :style="'padding-top:'+(startHeight-70)+'px'">
                </td>
              </tr>
          </template>
          <template v-if="start + perPage < this.tutorials.length" v-slot:body.append>
            <tr>
              <td :colspan="headers.length" :style="'padding-top:'+endHeight+'px'">
              </td>
            </tr>
          </template>
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
        <v-container v-if = "currInvoice" class="grey lighten-2 mx-5 mt-5 elevation-3" >
          <export-excel 
            :data="supplierFilter" 
            :fields="xlsHeders"
            type="xlsx"
            :name=currInvoice.supplier
            :title=currInvoice.supplier
            :footer=this.supplierTotal.toLocaleString()
            class="mt-3">
            <h5 style="text-align:center">{{currInvoice.supplier}}   -   {{this.supplierTotal.toLocaleString()}}
              <v-btn small class="btn btn-danger"> 
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </h5>
          </export-excel>
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
          <export-excel 
            :data="projectFilter" 
            :fields="xlsHeders"
            type="xlsx"
            :name=currInvoice.project
            :title=currInvoice.project
            :footer=this.projectTotal.toLocaleString()
            class="mt-3">
            <h5 style="text-align:center">{{currInvoice.project}}   -   {{this.projectTotal.toLocaleString()}}
              <v-btn small class="btn btn-danger"> 
                <v-icon>mdi-download</v-icon>
              </v-btn>
            </h5>
          </export-excel>

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
        { text: "Description", value: "description", class: 'success title', groupable: false, width: '20%' },
        { text: "Supplier", value: "supplier", class: 'success title' },
        { text: "Amount", value: "amount", class: 'success title', groupable: false, align:'right'  },
        { text: "Vat", value: "vat", class: 'success title', groupable: false, align:'right'  },
        { text: "Total", value: "total", class: 'success title', groupable: false, align:'right'  },
        { text: "Invoice ID", value: "invoiceId", class: 'success title', groupable: false  },
        { text: "Excel Rec ID", value: "excelRecID", class: 'success title', groupable: false, width: '4%'  },
        { text: "Remark", value: "remark", class: 'success title', groupable: false, width: '20%'  },
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
      yearList : [2020, 2021, 2022, 'ALL'],
      selectedYear : 2022,
      start: 0,
      timeout: null,
      rowHeight: 24,
      perPage: 25,
    };
  },

  methods: {
    rowClicked(row) {
      this.currInvoice = row;
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
      TutorialDataService.findByYear(this.selectedYear)
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


    loadTable:function (table_id) {
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

    onScroll(e) {
      // debounce if scrolling fast
      this.timeout && clearTimeout(this.timeout);
 
      this.timeout = setTimeout(() => {
        const { scrollTop } = e.target;
        const rows = Math.ceil(scrollTop / this.rowHeight);

        this.start = rows + this.perPage > this.tutorials.length ?
          this.tutorials.length - this.perPage: rows;

        this.$nextTick(() => {
          e.target.scrollTop = scrollTop;
        });
      }, 20);
    },
  },
  computed: {
    tutorialsLimited() {
      return this.tutorials.slice(this.start, this.perPage+this.start);
    },
    startHeight() {
      return this.start * this.rowHeight - 32;
    },
    endHeight() {
      return this.rowHeight * (this.tutorials.length - this.start);
    },
  },
  mounted() {
    this.retrieveTutorials();
    this.loadRefTables();
    document.getElementById('virtual-scroll-table').addEventListener('wheel', this.onScroll);
    // this.companyName = this.loadTable(1);
    // console.log(this.companyName)
    this.isLoading = false;
  },
  watch : {
      selectedYear () {
        this.retrieveTutorials();
      },
  }
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
#virtual-scroll-table {
  max-height: 75vh;
  height: 75vh;
  overflow: auto;
}
</style>
