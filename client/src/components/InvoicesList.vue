<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="Invoices"
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
          dense>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> {{$route.params.project ? $route.params.project : selectedYear}} - {{Invoices.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4 sreach-width" clearable></v-text-field>
              <v-spacer></v-spacer>
              <export-excel
                :data="Invoices"
                :fields="xlsHeders"
                type="xlsx"
                name="all-data"
                :title="selectedCompany + ` - ` + selectedYear"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
            </v-toolbar>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ item.total ? item.total.toLocaleString() : "" }}</span>
              </template>
              <span>{{ item.pratim }}-{{ Number(item.record_schum).toLocaleString() }}-{{ item.cust_lname }}</span>
            </v-tooltip>
          </template>
          <template v-slot:[`item.vat`]="{ item }">
            <span> {{ item.vat ? item.vat.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <div class="description-width">
              <span> {{ item.description }}</span>
            </div>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <div class="amount-width d-grid">
              <span>{{ item.amount ? item.amount.toLocaleString() : "" }}</span>
              <td @click.stop>
                <span v-if="isMobile()" @click="getSummary('supplier', item.supplier)" class="summary"> {{ item.supplier }} </span>
              </td>
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
            <v-checkbox v-model="item.published" @click="updateOne(item)">
            </v-checkbox>
          </template>
        </v-data-table>
        <v-btn v-if="$route.params.project" @click="$router.go(-1)" class="mt-2 ml-10">back</v-btn>
      </v-flex>

      <!-- Add New/Update row dialog -->
      <v-dialog v-model="dialog" >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ invoiceID ? "Update" : "Add New" }}</span>
            <v-spacer></v-spacer>
            <v-btn v-show="invoiceID" @click="invoiceID=null"> Copy </v-btn>
          </v-card-title>
          <v-card-text>
            <v-container>
              <p v-show="msg">
                {{ msg }}
              </p>
              <v-form ref="form">
                <v-row>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.company" :items="companyName" label="חברה" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.project" :items="projectName" label="פרויקט" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.supplier" :items="supplierName" label="ספק" dense></v-combobox>
                  </v-col>
                  <v-col cols="12" class="no-padding">
                    <v-text-field v-model="invoice.description" label="תאור" reverse></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.amount" type="number" label="סכום" required></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.vat" type="number" label="מע'מ" ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.total" type="number" label="סה'כ" required></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.year" type="number" label="שנה"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.group" type="number" label="קובץ" required></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="invoice.date" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="invoice.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="invoice.date" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dialog.save(invoice.date)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.invoiceId" label="חשבונית"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.excelRecID" label="ExcelRecID"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="no-padding">
                    <v-text-field v-model="invoice.remark" label="הערה" reverse></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <div class="payments-wrapper">
              <h5>Payments</h5>
              <v-container>
                  <div v-for="(inv, i) in invoice.payments" :key="i" class="text-fields-row">
                      <v-row>
                          <v-col cols="4" sm="3">
                              <v-text-field label="checkID" v-model="inv.checkID" ></v-text-field>
                          </v-col>
                          <v-col cols="4" sm="3">
                              <v-text-field label="Payment" v-model="inv.payment" ></v-text-field>
                          </v-col>
                          <v-col cols="4" sm="3">
                            <div class="input-container">
                              <input v-model="inv.date" type="date" />
                            </div>
                          </v-col>
                          <v-col cols="3">
                              <v-btn @click="removePaymentRec(i)" class="error" x-small><v-icon small >mdi-delete</v-icon></v-btn>
                          </v-col>
                      </v-row>
                  </div>                    
                  <v-btn @click="addPaymentRow" class="primary" small><v-icon small >mdi-plus</v-icon></v-btn>					
              </v-container>
          </div>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="invoiceID ? updateInvoice() : saveNewInvoice()">
              {{ invoiceID ? "Update" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon v-show="invoiceID" color="red" @click="deleteOne(invoice.id, invoice.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialog = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
              class="elevation-3"
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
                        {{ summaryName }} - {{ summaryTotal.toLocaleString() }}
                        <v-btn small class="btn btn-danger">
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
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
import { INVOICE_MOBILE_HEADERS, INVOICE_MODEL, INVOICE_WEB_HEADERS, TABLE_MODEL, BOOKS_MODEL, NEW_INVOICE } from "../constants/constants";

Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	name: "invoices-list",
	data() {
		return {
			Invoices: [],
			companyName: [],
			projectName: [],
			supplierName: [],
			invoiceID: 0,
			dialog: false,
      bookDialog: false,
			summaryDialog: false,
      summaryTotal: 0,
			summaryFilter: [],
			summaryName: "",
      expanded: [],
			summaryHeaders: [
				{ text: "Remarks", value: "remark", align: "right", class: "hdr-styles"},
				{ text: "Total", value: "total", align: "right", class: "hdr-styles" },
				{ text: "Description", value: "description", align: "right", class: "hdr-styles" },
				{ text: "Project", value: "project", align: "right", class: "hdr-styles" },
				{ text: "Supplier", value: "supplier", align: "right", class: "hdr-styles" },
				{ text: "Date", value: "date", align: "right", class: "hdr-styles" },
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
			},
			invoice: [],
			msg: "",
			isLoading: true,
			itemToEdit: "",
			selectedYear: 2023,
			selectedCompany: 'ביצועים',
      bookInfo: '',
      dateModal : false,
		};
	},

	methods: {
		getHeaders() {
			if (this.isMobile()) {
				return INVOICE_MOBILE_HEADERS;
			} else {
				return INVOICE_WEB_HEADERS;
			}
		},
		
		async getSummary(summaryField, summaryItem) {
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
		},

		isMobile() {
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				return true;
			} else {
				return false;
			}
		},
		async deleteOne(id, description) {
			if (window.confirm(`Are you sure you want to delete this item ? ` + description)) {
				const response = await apiService.deleteOne({model: INVOICE_MODEL,id});
				if (response) {
					this.dialog = false;
					this.refreshList();
				}
			}
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
			// console.log(this.$router.options.routes)
			if (this.$route.query.year) {
        this.selectedYear = this.$route.query.year
      }

    let response = '';
			this.isLoading = true;
      if (this.$route.params.project) {
        response = await apiService.getMany({
          model: INVOICE_MODEL,
          project: this.$route.params.project,
        });
      } else {
        response = await apiService.getMany({
          model: INVOICE_MODEL,
          year: this.selectedYear,
          company: this.selectedCompany,
        });
      }
			if (response && response.data) {
				this.Invoices = response.data;
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
			if (window.confirm(`Are you sure you want to delete all items of year ${this.selectedYear} ?`)) {
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

		saveNewInvoice: async function () {
			try {
				const response = await apiService.create(this.invoice, {model: INVOICE_MODEL});
				if (response) {
					this.invoice.id = response.data.id;
					this.refreshList();
					this.clearForm();
					this.dialog = false;
				}
			} catch (error) {
				this.msg = JSON.stringify(error.message);
				setTimeout(() => {
					this.msg = "";
				}, 3000);
				console.log(error);
			}
		},
    // this is called from the update dialog
		async updateInvoice() {
			try {
				const response = await apiService.update(this.invoiceID, this.invoice, { model: INVOICE_MODEL });
				if (response) {
					this.refreshList();
					this.clearForm();
					this.invoiceID = 0;
					this.dialog = false;
				}
			} catch (error) {
				this.msg = JSON.stringify(error.message);
				setTimeout(() => {
					this.msg = "";
				}, 3000);
				console.log(error);
			}
		},

		clearForm() {
			this.$refs.form.reset();
		},

    // get invoice data before open dialog for edit
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
				this.dialog = true;
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

		//Background of row if added to Book table
		itemRowBackground(item) {
			let classes = item.excelRecID ? "bg-green" : "";
			if (this.isMobile()) {
				classes = `${classes} mobile-items`;
			}
			return classes;
		},

    removePaymentRec(index) {
			this.invoice.payments.splice(index, 1);
		},

    addPaymentRow() {
			this.invoice.payments.push({ checkID: 0, payment: 0, date: moment(new Date()).format('YYYY-MM-DD') });
      console.log(this.invoice)
		},
	},

	async mounted() {
		this.retrieveInvoices();
		await this.loadTable(1, "companyName");
		await this.loadTable(2, "projectName");
		await this.loadTable(3, "supplierName");

    this.$root.$on("addNewInvoice", () => {
			this.dialog = true;
			this.invoiceID = 0;
      this.invoice = NEW_INVOICE;
		});

    this.$root.$on("yearChange", (year) => {
			this.selectedYear = year;
		});

    this.$root.$on("companyChange", (company) => {
			this.selectedCompany = company;
		});

		this.$root.$on("removeAllItems", () => {
			// setTimeout(100);
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
    })
	},
	
  watch: {
		selectedYear() {
			this.retrieveInvoices();
		},
    selectedCompany() {
			this.retrieveInvoices();
      this.refreshList();
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
}
.sreach-width {
  width: 4rem;
  margin-top: 1.5rem !important;
}
.no-padding {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}
</style>
