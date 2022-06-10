

<template>
  <div class="list row">
    <!-- <div class="input-group mb-3 mt-3">
      <input type="text" class="form-control" placeholder="Search in description field" v-model="searchStr"/>
      <v-btn @click="searchSTR" class="ml-2 mr-2"> Search </v-btn>
    </div>  -->
    <!-- <AddInvoice></AddInvoice> -->
    <v-layout>
      <v-flex xs12 md10>
        <v-row>
          <v-col v-if="!isMobile()"  :cols="12" sm="6" md="3">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search1"
              single-line
              :class="isMobile() ? 'mobile-search' : ''"
            ></v-text-field>
          </v-col>

          <!-- <v-col class="mt-2" cols="4" sm="4" md="3">
              <v-select :class="isMobile() ? '' : 'mt-3'"
                :items="yearList"
                v-model="selectedYear"
                dense
                solo
            ></v-select>
          </v-col>

          <v-col v-show="isMobile()" col="2">
            <template>
              <div class="mt-2 text-center">
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in items"
                      :key="index"
                    >
                      <template v-if="item.newRow">
                          <v-list-item-title  @click="dialog=true">
                            Add new row
                          </v-list-item-title>
                      </template>

                      <v-list-item-title v-else-if="(item.remove)" @click="item.onClick && item.onClick" >{{ item.title }}</v-list-item-title>
                          <export-excel 
                            v-else-if="item.excel"
                            :data="tutorials" 
                            :fields="xlsHeders"
                            type="xlsx"
                            name="export"
                            title="This is Title"
                            footer="This is footer"
                            >
                              <v-list-item-title >
                                {{item.title}}
                              </v-list-item-title>
                          </export-excel>

                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-col> -->

          <span v-show="!(isMobile())">
            <v-col cols="4" sm="4" md="3">
              <export-excel 
                :data="tutorials" 
                :fields="xlsHeders"
                type="xlsx"
                name="export"
                title="This is Title"
                footer="This is footer"
                >
                <v-btn :class="isMobile() ? 'font-size-mobile' : 'mt-4'" class="btn btn-danger"> 
                  <v-icon>mdi-download</v-icon>Download To Excel
                </v-btn>
              </export-excel>
            </v-col>
            <v-col cols="3" sm="4" md="3">
                <v-btn :class="isMobile() ? 'font-size-mobile ml-4' : 'mt-4'" class="btn btn-danger" @click="removeAllTutorials">
                  Remove All
                </v-btn>
            </v-col>
          </span>

        </v-row>
        <v-data-table 
            :headers="getHeaders()"
            :items="tutorials" 
            :search="search"
            @click:row="rowClicked"
            disable-pagination
            hide-default-footer
            fixed-header
            mobile-breakpoint="0"
            height="90vh"
            class="elevation-3 table-margin"
            :item-class="itemRowBackground"
            loading = "isLoading"
            loading-text="Loading... Please wait"
            item-key="_id"
            :show-expand="true"
            :single-expand="true"
            :expanded.sync="expanded"
          >

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
      </v-flex>


      <!-- New row dialog -->


            <v-dialog
              v-model="dialog"
              max-width="600px"
            >
              <v-card>
                <v-card-title>
                  <span class="text-h5">Add New</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                  <p v-show="msg">
                    {{msg}}
                  </p>
                  <v-form ref="form">
                   <v-row>
                      <v-col  cols="12" sm="6" md="4">
                        <v-combobox
                          v-model="invoice.company"
                          :items="companyName"
                          label="Company"
                          dense
                        ></v-combobox>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-combobox
                          v-model="invoice.project"
                          :items="projectName"
                          label="Project"
                          dense
                        ></v-combobox>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.description" label="Description" required></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.amount" type="number" label="Amount" required></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.vat" type="number" label="Vat"></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.year" type="number" label="Year"></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.total" type="number" label="Total" required></v-text-field>
                      </v-col>              
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.group" type="number" label="Group" required></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
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
                      <v-col  cols="12" sm="6" md="4">
                        <v-combobox
                          v-model="invoice.supplier"
                          :items="supplierName"
                          label="Supplier"
                          dense
                        ></v-combobox>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.invoiceId" label="Invouce Id"></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.excelRecID" label="ExcelRecID"></v-text-field>
                      </v-col>
                      <v-col  cols="12" sm="6" md="4">
                        <v-text-field v-model="invoice.remark" label="Remark"></v-text-field>
                      </v-col> 
                    </v-row>
                    </v-form>
                  </v-container>
                  <small>*indicates required field</small>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn @click="saveInvoice"> -Add- </v-btn>
                <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

    <!-- ----------------------- -->

      <!-- this section is the summary of the supplier -->
  <v-dialog
    v-model="detailDialog"
    max-width="600px"
  >
  <v-card>
    <v-card-title>
      <span class="text-h5">Summary</span>
    </v-card-title>
    <v-card-text :class="isMobile() ? 'margin-card' : ''">
      <v-flex>
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

    </v-card-text>
  </v-card>
  </v-dialog>
    </v-layout>
    
  </div>
</template>



<script>
import TutorialDataService from "../services/TutorialDataService";
import TableDataService from "../services/TableDataService";
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
      dialog: false,
      detailDialog: false,
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
      headers:[],
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
      msg: '',
      fldRules: [v => !!v || 'Field is required'],
      isLoading: true,
      itemToEdit: "",
      items: [
        { title: 'Add new row', onClick:  this.addNewRow, newRow: true },
        { title: 'Remove all items', onClick:  this.removeAllTutorials, remove:true},
        { title: 'Download to excel', onClick: undefined, excel: true },
      ],
      corrolatedBook: "",
      selectedYear : 2022,
      start: 0,
      timeout: null,
      rowHeight: 24,
      perPage: 25,
    };
  },

  methods: {
    getHeaders() {
      if(this.isMobile()) {
        return [
          { text: "^", value: "data-table-expand", class: 'success mobile-headers expantion-button', groupable: false },
          { text: "Date", value: "date", class: 'success mobile-headers', groupable: false  },
          { text: "Description", value: "description", class: 'success mobile-headers', groupable: false, width: '20%', align:'right' },
          { text: "Amount", value: "amount", class: 'success mobile-headers', groupable: false, align:'right'  },
          { text: "Act.", value: "actions", sortable: false, class: 'success mobile-headers', groupable: false  },
        ]
      } else {
        return [
          { text: "^", value: "data-table-expand", class: 'success title', groupable: false },
          { text: "G", value: "group", class: 'success title' },
          { text: "Comp.", value: "company", class: 'success title', width: '4%'},
          { text: "Project", value: "project", class: 'success title' },
          { text: "Date", value: "date", class: 'success title', groupable: false  },
          { text: "Description", value: "description", class: 'success title', groupable: false, width: '20%', align:'right' },
          { text: "Supplier", value: "supplier", class: 'success title', align:'right' },
          { text: "Amount", value: "amount", class: 'success title', groupable: false, align:'right'  },
          { text: "Vat", value: "vat", class: 'success title', groupable: false, align:'right'  },
          { text: "Total", value: "total", class: 'success title', groupable: false, align:'right'  },
          { text: "Invoice ID", value: "invoiceId", class: 'success title', groupable: false, align:'right'  },
          { text: "Excel Rec ID", value: "excelRecID", class: 'success title', groupable: false, width: '4%'  },
          { text: "Remark", value: "remark", class: 'success title', groupable: false, width: '20%', align:'right'  },
          { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
          { text: "P", value: "published", class: 'success title', groupable: false  },
          //{ text: "Year", value: "year", class: 'success title'},
          //{ text: "Pratim", value: "pratim", sortable: false, class: 'success title', groupable: false  },
        ]
      }
    },
    rowClicked(row) {
      this.currInvoice = row;
      if(row.supplier || row.project){
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
        this.detailDialog = true;
      }
    },
    isMobile() {
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true
      } else {
        return false
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
      this.isLoading = true;
      TutorialDataService.findByYear(this.selectedYear)
        .then((response) => {
          this.tutorials = response.data;
          this.isLoading = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    loadTable:async function (table_id,key) {
      try {
        const response = await TableDataService.findByTableID(table_id);
        if(response) {
          this[key] = response.data.map(code => code.description);
        }
      } catch (error) {
        console.log(error);
      }
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
    addNewRow() {
      
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

    saveInvoice: async function() {
      try {
        const response = await TutorialDataService.create(this.invoice);
        if(response) {
            this.invoice.id = response.data.id;
            this.refreshList();
            this.clearForm();
        }        
      } catch (error) {
        this.msg = JSON.stringify(error.message);
        setTimeout(() => {
          this.msg = '';
        }, 3000);
        console.log(error);
      }

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
      let classes = item.pratim ? 'bg-green' : '';
      if(this.isMobile()) {
        classes = `${classes} mobile-items`;
      }
      return classes;
		},
  },
  async mounted() {
    this.retrieveTutorials();
    await this.loadTable(1,'companyName');
    await this.loadTable(2,'supplierName');
    await this.loadTable(3,'projectName');
    this.$root.$on('addNewRow',() => {
      this.dialog = true;
    });
    this.$root.$on('yearChange',(year) => {
      this.selectedYear = year;
    });
    this.isLoading = false;
  },
  watch : {
      selectedYear () {
        this.retrieveTutorials();
      },
  }
}



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

.mobile-headers{
  font-size: 11px !important;
  padding: 0 !important;
}

.mobile-items > td {
  font-size: 10px !important;
}

.expantion-button{
  padding-left: 22px !important;
}

.font-size-mobile{
  font-size: 8px !important;
  padding: 1px 3px 1px 3px !important;
}

.mobile-search{
  margin-top: 5px !important;
  margin-bottom: -30px;
}

.mt-4{
  margin-top: 15px !important;
}

.table-margin{
  margin-top: 29px;
}

.margin-card{
  margin: -25px;
}
</style>
