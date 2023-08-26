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
              <v-col style="text-align-last: center;">
              <export-excel
                :data="invoiceList"
                :fields="xlsHeders"
                type="xlsx"
                name="all-data"
                :title="selectedCompany + ` - ` + selectedYear"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
              <v-btn @click="exportAll" x-small class="mx-3">All</v-btn>
              <v-btn @click="scriptUpdate" x-small class="mx-3">sUpdate</v-btn>
            </v-col>
            </v-toolbar>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.date | formatDate }}</span>
            <td @click.stop>
              <span v-if="isMobile()" @click="getSummary('group', item.group)" class="summary" style="margin-left: 1.9rem">{{ item.group }}</span>
            </td>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ item.total ? item.total.toLocaleString() : "" }}</span>
              </template>
              <span>Budget - </span>
            </v-tooltip>
          </template>
          <template v-slot:[`item.vat`]="{ item }">
            <span> {{ item.vat ? item.vat.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <div class="description-width">
              <span> {{ item.description }}</span>
              <td @click.stop>
                <span v-if="isMobile()" @click="getSummary('supplier', item.supplier)" class="summary"> {{ item.supplier }} </span>
              </td>
            </div>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <div class="amount-width d-grid">
              <span>{{ item.amount ? item.amount.toLocaleString() : "" }}</span>
            </div>
          </template>
          <template v-slot:[`item.supplier`]="{ item }">
            <td @click.stop>
              <span @click="getSummary('supplier', item.supplier)" class="summary">{{ item.supplier }}</span>
            </td>
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
              <v-checkbox v-model="item.published" @click="updateOne(item)"></v-checkbox>
            </td>
          </template>
        </v-data-table>
        <v-btn v-if="$route.params.project" @click="$router.go(-1)" class="mt-2 ml-10">back</v-btn>
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
    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { INVOICE_MOBILE_HEADERS, INVOICE_MODEL, INVOICE_WEB_HEADERS, 
          TABLE_MODEL, BOOKS_MODEL, NEW_INVOICE, VAT_PERCENTAGE } from "../constants/constants";
import invoiceForm from "./InvoiceForm.vue"
import { isMobile } from '../constants/constants';
Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	name: "invoices-list",
  props: ['showSelect'],
	components: { invoiceForm },
	data() {
		return {
      isMobile,
			invoiceList: [],
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
				{ text: "G", value: "group", align: "right", class: "hdr-styles" },
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
				נשלח: "published",
        year: "year",
			},
			invoice: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
			selectedYear: 2023,
			selectedCompany: 'ביצועים',
      bookInfo: '',
      dateModal : false,
      selected: [],
      header: '',
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
			// console.log(this.$route.params)
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
        this.invoiceList.sort((a, b) => b.group - a.group);
				this.isLoading = false;
			}
		},

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
				if (response) {
					this[tableName] = response.data.map((code) => code.description);
				}
			} catch (error) {
				console.log(error);
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
			if (window.confirm(`Are you sure you want to merge record_id with excelRecID ?`)) {
				const	response = await SpecificServiceEndPoints.batchBookInvoice() ;
				if (response) {
					this.refreshList();
					window.location.reload();
				}
			}
		},

		async batchInvoiceBook() {
			if (window.confirm(`Are you sure you want to merge record_id with excelRecID (All years) ?`)) {
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
				this.invoiceID = item._id;
				const response = await apiService.getById(item._id, { model: INVOICE_MODEL });
				// const response = await apiService.getById("6413f03e3a77dfaf6a052718", { model: INVOICE_MODEL });
				if (response && response.data) {
					this.invoice = response.data; 
          this.invoice.date = moment(this.invoice.date).format('YYYY-MM-DD');
          if(this.invoice.payments && this.invoice.payments.length) {
            this.invoice.payments.map(payment => {
              payment.date = moment(payment.date).format('YYYY-MM-DD')
            });
          }
				}
				// this.dialog = true;
			  await this.$refs.invoiceForm.open(this.invoice, false);
			}
		},

    // called @click on toggle "published" field
		async updateOne(item) {
			await apiService.update(
				item._id,
				{ published: item.published },
				{ model: INVOICE_MODEL }
			);
			this.itemToEdit = "";
		},

    // run this batch to update 
    async scriptUpdate() {
      let response = await apiService.getMany({model: INVOICE_MODEL, supplier: 'אייל'})
      console.log(response.data)
      if(response.data){
        response.data.map((item) => {
          apiService.update(
            item._id,
            { supplier: '' },
            { model: INVOICE_MODEL }          
          )
        })
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

    // removePaymentRec(index) {
		// 	this.invoice.payments.splice(index, 1);
		// },

    addPaymentRow() {
			this.invoice.payments.push({ checkID: 0, payment: 0, date: moment(new Date()).format('YYYY-MM-DD') });
		},

    onAmountChange() {
      let { amount } = this.invoice;
      if(amount && amount >= 0) {
          this.invoice.vat = ((parseFloat(amount) * VAT_PERCENTAGE)/100)
          this.invoice.total = (this.invoice.vat + parseFloat(amount)).toFixed(0);
      } else {
          this.invoice.amount = 0;
          this.invoice.vat = 0;
          this.invoice.total = 0;
      }
    },

    onTotalChange() {
      let { total } = this.invoice;
      if(total && total >= 0) {
          this.invoice.amount = (parseFloat(total)/(1+VAT_PERCENTAGE/100)).toFixed(0);
          this.invoice.vat = (parseFloat(total)- this.invoice.amount).toFixed(0);
      } else {
          this.invoice.amount = 0;
          this.invoice.vat = 0;
          this.invoice.total = 0;
      }
    },

    onDateChange() {
      this.invoice.year = new Date((this.invoice.date)).getFullYear();
    },

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
    }

	},

	async mounted() {
		this.retrieveInvoices();
		await this.loadTable(1, "companyName");
		await this.loadTable(2, "projectName");
		await this.loadTable(3, "supplierName");
    this.$root.$on("addNewInvoice", async () => {
			// this.dialog = true;
			this.invoiceID = 0;
      this.invoice = NEW_INVOICE;
      await this.$refs.invoiceForm.open(this.invoice, true);
		});

    this.$root.$on("yearChange", (year) => {
			this.selectedYear = year;
		});

    this.$root.$on("companyChange", (company) => {
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
  text-align: -webkit-right;
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

.payments-wrapper{
    border: 3px solid #85a7ff;
    margin-left: 5px !important;
    margin-right: 5px !important;
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
.sreach-width {
  width: 4rem;
  margin-top: 1.5rem !important;
}
.no-padding {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  text-align-last: end;
}
</style>
