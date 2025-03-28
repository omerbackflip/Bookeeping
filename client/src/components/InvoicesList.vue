<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="invoiceList"
          :search="search"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :item-class="itemRowBackground"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          @click:row="getInvoiceForEdit"
          @input="selectRow()"
          :show-select="showSelect"
          single-select
          item-key="_id"
          v-model="selected"
          dense>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> {{header}} - {{invoiceList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4 sreach-width" clearable></v-text-field>
              <v-spacer></v-spacer>
              <div @click="toggleList" :class="{'hdr-styles' : notPayedList}">
                To pay = {{ pending.toLocaleString("en", {minimumFractionDigits: 0,maximumFractionDigits: 0,}) }}
              </div>
              <v-spacer></v-spacer>
              <div v-show="!isMobile()">
                <v-row>
                  <v-col>
                  <export-excel :data="invoiceList" type="xlsx" name="all-data">
                  <!-- <export-excel :fetch="fetchData" type="xlsx" name="all-data"> -->
                    <v-btn x-small class="btn btn-danger">
                      <v-icon small>mdi-download</v-icon>
                    </v-btn>
                  </export-excel>
                </v-col>
                <v-col>
                  <!-- <v-btn @click="exportAll" x-small class="mx-3">All</v-btn> don't need because there is "fetchData"-->
                  <!-- <v-btn @click="scriptUpdate" x-small class="mx-3">sUpdate</v-btn> -->
                  <v-btn @click="uploadBackup2GDrive" x-small class="mx-3">backup</v-btn>
                </v-col>
                </v-row>
              </div>
            </v-toolbar>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <span>{{ item.total ? item.total.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.vat`]="{ item }">
            <span> {{ item.vat ? item.vat.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.payments[0].payment`]="{ item }">
            <span> {{ item.payments[0] ? item.payments[0].payment.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <div class="description-width">
              <span class="desc-oflow"> {{ item.description }}</span>
              <!-- <td @click.stop> -->
                <!-- <span v-if="isMobile()" @click="getSummary('supplier', item.supplier)" class="summary"> {{ item.supplier }} </span> -->
                <span v-if="isMobile()" style="margin-left: 0.5rem; font-size: small"> {{ item.date | formatDate }}</span>
              <!-- </td> -->
            </div>
          </template>
          <template v-slot:[`item.remark`]="{ item }">
            <div class="description-width">
              <span> {{ item.remark }}</span>
            </div>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <div class="amount-width d-grid">
              <span>{{ item.amount ? item.amount.toLocaleString("en", {minimumFractionDigits: 0, maximumFractionDigits: 0}) : "" }}</span>
            </div>
          </template>
          <template v-slot:[`item.supplier`]="{ item }">
            <div class="description-width">
              <td @click.stop>
                <span @click="getSummary('supplier', item.supplier)" class="summary" style="font-size: small">{{ item.supplier }}</span>
              </td>
              </div>
              <div>
              <td @click.stop>
                <span v-if="isMobile()" style="margin-left: 0.7rem; font-size: small"
                :class="item.GDFileId ? 'summary' : ''" @click.stop="item.GDFileId ? clickToView(item.GDFileId) : null">{{ item.invoiceId }}</span>
              </td>
            </div>
          </template>
          <template v-slot:[`item.excelRecID`]="{ item }">
            <td @click.stop>
              <span @click="retriveBookData(item)" class="summary">{{ item.excelRecID }}</span>
            </td>
          </template>
          <template v-slot:[`item.project`]="{ item }">
            <td @click.stop>
              <span @click="getSummary('project', item.project)" class="summary">{{ item.project }}</span>
            </td>
          </template>
          <template v-slot:[`item.group`]="{ item }">
            <td @click.stop>
              <span @click="getSummary('group', item.group)" class="summary" style="margin-left: 0.7rem">{{ item.group }}</span>
            </td>
          </template>
          <template v-slot:[`item.published`]="{ item }">
            <td @click.stop>
              <v-checkbox v-model="item.published" @click="togglePublished(item)"></v-checkbox>
            </td>
          </template>
          <template v-slot:[`item.invoiceId`]="{ item }">
            <!-- <td> -->
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span v-on="on" :class="item.GDFileId ? 'summary' : ''" @click.stop="item.GDFileId ? clickToView(item.GDFileId) : null">{{ item.invoiceId }}</span>
                </template>
                <span>{{item.GDFileName}}</span>
              </v-tooltip>
            <!-- </td> -->
          </template>
        </v-data-table>
        
        <v-btn v-if="$route.params.project || $route.params.supplier" @click="$router.go(-1)" class="mt-2 ml-10">back</v-btn>
      </v-flex>

      <!-- SummaryDialog for supplier/Project/Group -->
      <v-dialog v-model="summaryDialog" max-width="1100px">
        <v-card>
          <v-flex>
            <v-data-table
              :headers="summaryHeaders"
              :items="summaryFilter"
              disable-pagination
              hide-default-footer
              fixed-header
              :item-class="itemRowBackground"
              mobile-breakpoint="0"
              @click:row="getInvoiceForEdit"
              class="elevation-3 list"
              dense
              height="70vh">
              <template v-slot:top>
                <v-toolbar>
                  <v-spacer />
                    <export-excel
                      :data="summaryFilter"
                      :fields="xlsHeders"
                      type="xlsx"
                      :name="summaryName.toLocaleString()"
                      :title="summaryName"
                      :footer="summaryTotal.toLocaleString()"
                      class="mt-3">
                      <v-toolbar-title>
                        <div>
                          <span>{{ summaryName }} - {{ summaryTotal.toLocaleString() }}  </span>
                          <span v-if="summaryBudget">{{ ' ------------ תקציב - '  + summaryBudget.toLocaleString()}}</span>
                          <v-btn small class="btn btn-danger"> <v-icon>mdi-download</v-icon> </v-btn>
                        </div>
                      </v-toolbar-title>
                    </export-excel>
                  <v-spacer />
                </v-toolbar>
              </template>
              <template v-slot:[`item.total`]="{ item }">
                <span>{{ item.total ? item.total.toLocaleString() : "" }}</span>
              </template>
              <template v-slot:[`item.date`]="{ item }">
                <span> {{ item.date | formatDate }}</span>
              </template>
              <template v-slot:[`item.published`]="{ item }">
                <td @click.stop>
                  <v-checkbox v-model="item.published" @click="togglePublished(item)"></v-checkbox>
                </td>
              </template>
              <template v-slot:[`item.invoiceId`]="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <span v-on="on" :class="item.GDFileId ? 'summary' : ''" @click.stop="item.GDFileId ? clickToView(item.GDFileId) : null">{{ item.invoiceId }}</span>
                    </template>
                    <span>{{item.GDFileName}}</span>
                  </v-tooltip>
              </template>
            </v-data-table>
          </v-flex>
        </v-card>
      </v-dialog>

      <invoice-form ref="invoiceForm"/>

      <v-dialog v-model="bookDialog" max-width="600px">
        <v-card>
          <v-card-text class="margin-card">
            <v-flex>
              <v-container class="grey lighten-2 elevation-3">
                Data from Book - {{bookInfo.length}}
                <v-data-table
                  :headers="bookHeaders"
                  :items="bookInfo"
                  disable-pagination
                  hide-default-footer
                  mobile-breakpoint="350"
                  fixed-header
                  class="elevation-3"
                  dense
                >
                <template v-slot:[`item.asmchta_date`]="{ item }">
                  <span> {{ item.asmchta_date | formatDate }}</span>
                </template>
                </v-data-table>
              </v-container>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>

      <modal-dialog ref="modalDialog"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "@/services/apiService";
import SpecificServiceEndPoints from "@/services/specificServiceEndPoints";
import { INVOICE_MOBILE_HEADERS, INVOICE_MODEL, INVOICE_WEB_HEADERS, 
          TABLE_MODEL, BOOKS_MODEL, NEW_INVOICE, VAT_PERCENTAGE, 
          loadTable} from "@/constants/constants";
import invoiceForm from "./InvoiceForm.vue"
import { isMobile } from '@/constants/constants';
Vue.use(excel);
import modalDialog from './Common/InvoiceModal.vue';

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
let gapi = window.gapi;
export default {
	name: "invoicesList",
  props: ['showSelect'],
	components: { invoiceForm, modalDialog },
	data() {
		return {
      isMobile,
      loadTable,
			invoiceList: [],
			previusList: [], // used to store the prevoius invoiceList
			companyName: [],
			projectName: [],
			supplierName: [],
			invoiceID: 0,
			dialog: false,
      bookDialog: false,
			summaryDialog: false,
      summaryTotal: 0,
      summaryBudget: 0,
			summaryFilter: [],
			summaryName: "",
      expanded: [],
			summaryHeaders: [
				{ text: "Remarks", value: "remark", align: "right", class: "hdr-styles"},
				{ text: "Total", value: "total", align: "right", class: "hdr-styles" },
				{ text: "Description", value: "description", align: "right", class: "hdr-styles" },
				{ text: "Project", value: "project", align: "right", class: "hdr-styles" },
				{ text: "Supplier", value: "supplier", align: "right", class: "hdr-styles" },
				{ text: "Invoice", value: "invoiceId", align: "right", class: "hdr-styles" },
				{ text: "Date", value: "date", align: "right", class: "hdr-styles" },
				{ text: "Group", value: "group", align: "right", class: "hdr-styles" },
				{ text: "P", value: "published", align: "right", class: "hdr-styles" },
			],
      bookHeaders: [
        { text: "Record_ID", value: "record_id", aligh: "right"},
        { text: "asmacta1", value: "asmacta1", aligh: "right"},
        { text: "date", value: "asmchta_date"},
        { text: "Amount", value: "record_schum", aligh: "right"},
        { text: "Description", value: "pratim", aligh: "right"},
      ],
			exportExcel: false,
			search: "",
			headers: [],
      paymentDateDialog: false,
			xlsHeders: {
				חברה: "company",
				פרויקט: "project",
				תאור: "description",
				סכום: "amount",
				"מע-מ": "vat",
				"סה-כ": "total",
				קיבוץ: "group",
				תאריך: "date",
				ספק: "supplier",
				חשבונית: "invoiceId",
				excelRecID: "excelRecID",
				הערה: "remark", 
				נפרע: "published",
        year: "year",
			},
			invoice: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
			selectedYear: '2025',
			selectedCompany: 'ביצועים',
      bookInfo: '',
      dateModal : false,
      selected: [],
      header: '',
      notPayedList: false,
      pending: '',
      folderId:localStorage.getItem('folderId'),
      token:localStorage.getItem('googleAccessToken'),
      developerKey:localStorage.getItem('developerKey')
		};
	},

          /* eslint-disable */
	methods: {
		getHeaders() {
			if (this.isMobile()) {
				return INVOICE_MOBILE_HEADERS;
			} else {
				return INVOICE_WEB_HEADERS;
			}
		},
		
		async getSummary(summaryField, summaryItem) {
      this.isLoading = true
      let response = "";
      switch (summaryField) {
        case 'project':
          // fatch all paymanets for this project cross years.
          response = await apiService.getMany({model: INVOICE_MODEL,project: summaryItem})
          this.summaryFilter = response.data
          break;
        case 'supplier':
          // fatch all paymanets for this supplier cross years.
          response = await apiService.getMany({model: INVOICE_MODEL,supplier: summaryItem})
          this.summaryFilter = response.data
          // get the busget of this supplier
          response = await apiService.getMany({model: TABLE_MODEL, table_id: 3, description: summaryItem})
          this.summaryBudget = response.data[0].table_code
          break;
        case 'group':
          // fatch all paymanets for this group cross years.
          response = await apiService.getMany({model: INVOICE_MODEL,group: summaryItem})
          this.summaryFilter = response.data
          break;
        default : break;
      }

      this.summaryFilter.sort((a, b) => new Date(b.date) - new Date(a.date)); // sort the summary by date

      this.summaryName = summaryItem;
      this.summaryTotal = this.summaryFilter.reduce((currentTotal, item) =>{
        return item.total + currentTotal
      }, 0)
      if (!this.summaryDialog) {
        this.summaryDialog = true;
      }
      this.isLoading = false
		},

    async retriveBookData(item){
      const response = await apiService.getMany({ model: BOOKS_MODEL,
                                              // record_id:item.excelRecID,
                                              asmacta1: item.invoiceId,
                                              year: item.year,
                                              company: item.company});
      this.bookInfo = response.data;
      this.bookDialog = true;
    },

		async retrieveInvoices() {
			// console.log(this.$router)
			if (this.$route.query.year) {
        this.selectedYear = this.$route.query.year
      }
      let response = '';
			this.isLoading = true;
      const screen = this.$route.params
      switch (true) {
        case ('project' in screen):
          response = await apiService.getMany({
            model: INVOICE_MODEL,
            project: this.$route.params.project,
          });
          this.header = this.$route.params.project
          break;
        case ('supplier' in screen):
          response = await apiService.getMany({
            model: INVOICE_MODEL,
            supplier: this.$route.params.supplier,
          });
          this.header = this.$route.params.supplier
          break;
        default :
          response = await apiService.getMany({
            model: INVOICE_MODEL,
            year: this.selectedYear,
            company: this.selectedCompany,
          });
          this.header = this.selectedYear + ' ' + this.selectedCompany
          break;     
      }
			if (response && response.data) {
				this.invoiceList = response.data;
        // this.invoiceList.sort((a, b) => b.group - a.group);
        this.invoiceList.sort((a, b) => {
          if (b.group !== a.group) {return b.group - a.group;} // Sort by group
          if (a.date !== b.date) {return new Date(b.date) - new Date(a.date);} // If group is the same, sort by date
          return new Date(b.createdAt) - new Date(a.createdAt); // If date is also the same, sort by createdAt
        });
        this.pending = this.invoiceList.filter((item) =>{
          return (item.published === false)
        }).reduce ((pendingTotal, item1) => {
          return item1.total + pendingTotal
        },0)
				this.isLoading = false;
			}
		},

		refreshList() {
			this.retrieveInvoices();
		},

		async removeAllInvoices() {
			if (window.confirm(`Are you sure you want to delete all INVOICES of year ${this.selectedYear} ?`)) {
				const response = await apiService.deleteAll({model: INVOICE_MODEL,year: Number(this.selectedYear),});
				if (response) {
					this.refreshList();
				}
			}
		},

		async batchBookInvoice() {
			if (window.confirm(`Are you sure you want to merge record_id with excelRecID (All data - run on BOOK table)?`)) {
				const	response = await SpecificServiceEndPoints.batchBookInvoice() ;
				if (response) {
					this.refreshList();
					window.location.reload();
				}
			}
		},

		async batchInvoiceBook() {
			if (window.confirm(`Are you sure you want to merge record_id with excelRecID (All data - run on INVOICE table) ?`)) {
				const	response = await SpecificServiceEndPoints.batchInvoiceBook() ;
				if (response) {
					this.refreshList();
					window.location.reload();
				}
			}
		},

		async batchClearExcelRecID() {
			if (window.confirm(`Are you sure you want to delete all ExcelRecID ? year ${this.selectedYear}`)) {
				const	response = await SpecificServiceEndPoints.batchClearExcelRecID(this.selectedYear) ;
				if (response) {
					this.refreshList();
					window.location.reload();
				}
			}
		},

		clearForm() {
			this.$refs.form.reset();
		},

    // get invoice data before call to invoiceForm for edit
		async getInvoiceForEdit(item) {
			if (item._id) {
        this.invoice = item
			  await this.$refs.invoiceForm.open(this.invoice, false);
		    this.retrieveInvoices();
			}
		},

    // called @click on toggle "published" field
		async togglePublished(item) {
			await apiService.update(
				item._id,
				{ published: item.published },
				{ model: INVOICE_MODEL }
			);
			this.itemToEdit = "";
      if (item.published) {
        this.pending = this.pending - item.total
      } else {
        this.pending = this.pending + item.total
      }
		},

    // run this batch to update 
    async scriptUpdate() {
      if (window.confirm("Change supplier xxx to yyy")) {
        let response = await apiService.getMany({model: INVOICE_MODEL, supplier: 'אייל'})
        if(response.data){
          response.data.map((item) => {
            apiService.update(
              item._id,
              { supplier: '' },
              { model: INVOICE_MODEL }          
            )
          })
        }
      }
    },

		//Background of row if added to Book table
		itemRowBackground(item) {
			let classes = item.excelRecID ? "bg-green" : "";
			if (this.isMobile()) {
				classes = `${classes} mobile-items`;
			}
			return classes;
		},

    // addPaymentRow() {
		// 	this.invoice.payments.push({ checkID: 0, payment: 0, date: moment(new Date()).format('YYYY-MM-DD') });
		// },

    // onAmountChange() {
    //   let { amount } = this.invoice;
    //   if(amount && amount >= 0) {
    //       this.invoice.vat = ((parseFloat(amount) * VAT_PERCENTAGE)/100)
    //       this.invoice.total = (this.invoice.vat + parseFloat(amount)).toFixed(0);
    //   } else {
    //       this.invoice.amount = 0;
    //       this.invoice.vat = 0;
    //       this.invoice.total = 0;
    //   }
    // },

    // onTotalChange() {
    //   let { total } = this.invoice;
    //   if(total && total >= 0) {
    //       this.invoice.amount = (parseFloat(total)/(1+VAT_PERCENTAGE/100)).toFixed(0);
    //       this.invoice.vat = (parseFloat(total)- this.invoice.amount).toFixed(0);
    //   } else {
    //       this.invoice.amount = 0;
    //       this.invoice.vat = 0;
    //       this.invoice.total = 0;
    //   }
    // },

    // onDateChange() {
    //   this.invoice.year = new Date((this.invoice.date)).getFullYear();
    // },

    selectRow() {
      // this.selected[0] ? this.$emit('lookForMatch', this.selected[0]) : ''
      this.$emit('lookForMatch', this.selected[0] || '')
    },

    async exportAll() {
      let response = '';
			this.isLoading = true;
      response = await apiService.getMany({ model: INVOICE_MODEL });
			if (response && response.data) {
				this.invoiceList = response.data;
        this.invoiceList.sort((a, b) => b.group - a.group);
        this.header = 'All Invoices '
				this.isLoading = false;
			}
    },

    async fetchData(){  // used during extract all data to "vue-excel-export"
        this.isLoading = true;
        const response = await apiService.getMany({model:INVOICE_MODEL})
        let data = response.data.map((item) => {
          item.date = new Date (item.date).toLocaleDateString('en-GB')
          return ({...item, payments: item.payments.length
            ? item.payments.map((item1) => {
                let redeemed = item1.redeemed ? true : false;
                return (["checkID",item1.checkID,
                        "date",new Date (item1.date).toLocaleDateString('en-GB'),
                        "payment",item1.payment,
                        "redeemed", redeemed])}) 
            : ''})
        })
        this.isLoading = false;
        return data;
    },

    async uploadBackup2GDrive(){
      this.isLoading = true;
      const response = await SpecificServiceEndPoints.Backup2GDrive();
      if(response.data.file_id){
        window.alert('file saved to GDrive');
        await apiService.findOneAndUpdate({description: `last bckp - ${moment (new Date()).format('DD/MM/YYYY')}`},
                                          {model:TABLE_MODEL, table_id: 99, table_code: 80})
      }
      this.isLoading = false;
    },

    toggleList() {
      if (this.notPayedList) {
        this.invoiceList = this.previusList;
      } else {
        this.previusList = this.invoiceList
        this.invoiceList = this.invoiceList.filter((item) => {
          return item.published === false
        })
      }
      this.notPayedList = !this.notPayedList
    },

    async clickToView(GDFileId) {
      var fileview = `https://docs.google.com/file/d/${GDFileId}/preview?usp=drivesdk`
      await this.$refs.modalDialog.open(fileview);
    },

    // loadPickerApi() {
    //   if (gapi) {
    //     gapi.load("picker", { callback: this.createPicker });
    //   } else {
    //     console.error("Google API not initialized");
    //   }
    // },

    // openDrive() {
    //   this.createPicker();  // Open the picker directly
    // },

    // async createPicker() {
    //   const token = this.token;  // Use the saved access token directly

    //   if (!token) {
    //     console.error('Access token is missing!');
    //     return;
    //   }
      
    //   const response = await checkGoogleStatus();
    //   console.log("connecting....");
    //   if (response.data.connected) {
    //     this.token = response.data.access_token;
    //   }

    //   const picker = new google.picker.PickerBuilder()
    //                     .addView(
    //                       new google.picker.DocsView(google.picker.ViewId.DRIVE)
    //                         .setParent(this.folderId)
    //                         .setIncludeFolders(true)
    //                     )
    //                     .setOAuthToken(token)
    //                     .setDeveloperKey(this.developerKey)
    //                     .build();

      
    //  // picker.setVisible(true);
      
    // },
	},

	async mounted() {
		this.retrieveInvoices();
    this.companyName = (await loadTable(1)).map((code) => code.description)
    this.projectName = (await loadTable(2)).map((code) => code.description)
    this.supplierName = (await loadTable(3)).map((code) => code.description)
    this.$root.$on("addNewInvoice", async () => {
			this.invoiceID = 0;
      this.invoice = NEW_INVOICE;
      this.invoice.date = moment(new Date()).format('YYYY-MM-DD')
      await this.$refs.invoiceForm.open(this.invoice, true);
		});

    this.$root.$on("yearChange", (year) => {
      this.notPayedList = false;
			this.selectedYear = year;
		});

    this.$root.$on("companyChange", (company) => {
      this.notPayedList = false;
			this.selectedCompany = company;
		});

		this.$root.$on("removeAllItems", () => {
			this.removeAllInvoices();
		});

    this.$root.$on("bookMarge", () => {
			this.batchBookInvoice();
		});
    
    this.$root.$on("invoiceMarge", () => {
			this.batchInvoiceBook();
		});
    
    this.$root.$on("clearExcelRecID", () => {
      this.batchClearExcelRecID();
    });

    // this.createPicker();
	},
	
  watch: {
		selectedYear() {
			this.retrieveInvoices();
		},
    selectedCompany() {
			this.retrieveInvoices();
		},
	},
};
</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  cursor: pointer;
}

.bg-green {
  background-color: lightgreen !important;
}

.mobile-headers {
  font-size: 11px !important;
}

.mobile-items > td {
  /* font-size: 13px !important; */
  padding: 0px !important;
}

.expantion-button {
  padding-left: 22px !important;
}

.font-size-mobile {
  font-size: 8px !important;
  padding: 1px 3px 1px 3px !important;
}

.mobile-search {
  margin-top: 5px !important;
  margin-bottom: -30px;
}

.mt-4 {
  margin-top: 15px !important;
}

.table-margin {
  margin-top: 0px;
}

.margin-card {
  /* margin: -25px; */
  padding-top: 20px !important;
}

.v-card__text{
  padding-bottom: 0px !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

th > i {
  display: none !important;
}

.d-grid {
  display: grid;
}

.amount-width {
  width: 100% !important;
  padding-right: 10px;
}
.description-width {
  width: 100% !important;
  /* text-align: -webkit-right; */
  direction: rtl;
}

.text-start > .v-data-table__expand-icon {
  width: 100% !important;
}

.table-margin-web{
	margin-top: 9px;
}

.summary {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
}

.theme--light.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    color: rgba(0, 0, 0, 0.6);
    white-space: nowrap;
}

.date-text{
  font-size: 12px !important;
}

.input-container input {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    font-size: 12px;
    border: 1px solid #5d5d5d;
    border-radius: 7px;
    padding: 8px 14px 8px 14px;
    margin-top: 12px;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
}

.hdr-styles{
	background: red !important;
	color: white !important;
}

.v-dialog{
    max-width: 600px;
    margin-top: 10px;
    margin-bottom: 10px;
    max-height: 70%;
}
.v-toolbar__title {
    font-size: 1rem;
    direction: rtl;
    white-space: pre-wrap;
    text-align: center;
}
.v-toolbar__content {
  padding-left: 0px;
  padding-right: 0px;
}
.sreach-width {
  width: 4rem;
  margin-top: 1.5rem !important;
}
.no-padding {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  text-align-last: end;
}
.desc-oflow {
  overflow: hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
  width:150px;
  display:inline-block;
}
</style>
