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
          class="elevation-3"
          :class="isMobile() ? 'table-margin' : 'table-margin-web'"
          :item-class="itemRowBackground"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          item-key="id"
          :show-expand="isMobile()"
          :single-expand="true"
          @click:row="editOne"
        >

          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> {{selectedYear}} - {{Invoices.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4"></v-text-field>
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
              <span v-if="isMobile()"> {{ item.supplier }} </span>
            </div>
          </template>
          <template v-slot:[`item.supplier`]="{ item }">
            <span @click="getSummary('supplier', item.supplier)" class="summary">{{ item.supplier }}</span>
          </template>
          <template v-slot:[`item.excelRecID`]="{ item }">
            <span @click="retriveBookData(item)" class="summary">{{ item.excelRecID }}</span>
          </template>
          <template v-slot:[`item.project`]="{ item }">
            <span @click="getSummary('project', item.project)" class="summary">{{ item.project }}</span>
          </template>
          <template v-slot:[`item.group`]="{ item }">
            <span @click="getSummary('group', item.group)" class="summary">{{ item.group }}</span>
          </template>
          <!-- <template v-slot:[`item.actions`]="{ item }">
            <v-icon v-show="item.excelRecID != null">mdi-checkbox-marked-circle</v-icon>
          </template> -->
          <template v-slot:[`item.published`]="{ item }">
            <v-checkbox v-model="item.published" @click="updateOne(item)">
            </v-checkbox>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td v-if="isMobile()" :colspan="headers.length">
              <ul>
                <li>group: {{ item.group }}</li>
                <li>company: {{ item.company }}</li>
                <li>project: {{ item.project }}</li>
                <li>supplier: {{ item.supplier }}</li>
                <li>vat: {{ item.vat }}</li>
                <li>total: {{ item.total }}</li>
                <li>Invoice Id: {{ item.invoiceId }}</li>
                <li>Excel record ID: {{ item.excelRecID }}</li>
                <li>remark: {{ item.remark }}</li>
                <li>published: {{ item.published ? "Yes" : "No" }}</li>
              </ul>
            </td>
          </template>
        </v-data-table>
      </v-flex>

      <!-- Add New/Update row dialog -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{
              updateInvoice ? "Update" : "Add New"
            }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <p v-show="msg">
                {{ msg }}
              </p>
              <v-form ref="form">
                <v-row>
                  <v-col cols="6" sm="6" md="4">
                    <v-combobox v-model="invoice.company" :items="companyName" label="Company" dense></v-combobox>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-combobox v-model="invoice.project" :items="projectName" label="Project" dense></v-combobox>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.description" label="Description" required></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.amount" type="number" label="Amount" required></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.vat" type="number" label="Vat"></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.year" type="number" label="Year"></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.total" type="number" label="Total" required></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.group" type="number" label="Group" required></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="invoice.date" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="invoice.date" label="Date" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on">
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="invoice.date" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dialog.save(invoice.date)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-combobox v-model="invoice.supplier" :items="supplierName" label="Supplier" dense></v-combobox>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.invoiceId" label="Invoice Id"></v-text-field>
                  </v-col>
                  <v-col cols="6" sm="6" md="4">
                    <v-text-field v-model="invoice.excelRecID" label="ExcelRecID"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="invoice.remark" label="Remark"></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="updateInvoice ? editInvoice() : saveInvoice()">
              {{ updateInvoice ? "Update" : "Create" }}
            </v-btn>
            <v-btn small v-show="!updateInvoice" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(invoice.id, invoice.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialog = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- SummaryDialog for supplier/Project/Group -->
      <v-dialog v-model="summaryDialog" max-width="600px">
        <v-card>
          <v-card-text class="margin-card">
            <v-flex>
              <v-container class="grey lighten-2 elevation-3">
                <export-excel
                  :data="summaryFilter"
                  :fields="xlsHeders"
                  type="xlsx"
                  :name="summaryName.toLocaleString()"
                  :title="summaryName"
                  :footer="summaryTotal.toLocaleString()"
                  class="mt-3"
                >
                  <h5 style="text-align: center">
                    {{ summaryName }} - {{ this.summaryTotal.toLocaleString() }}
                    <v-btn small class="btn btn-danger">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </h5>
                </export-excel>
                <v-data-table
                  :headers="summaryHeaders"
                  :items="summaryFilter"
                  disable-pagination
                  hide-default-footer
                  :item-class="itemRowBackground"
                  mobile-breakpoint="350"
                  fixed-header
                  class="elevation-3"
                  dense
                >
                  <template v-slot:[`item.total`]="{ item }">
                    <span>{{ item.total ? item.total.toLocaleString() : "" }}</span>
                  </template>
                  <template v-slot:[`item.date`]="{ item }">
                    <span> {{ item.date | formatDate }}</span>
                  </template>
                </v-data-table>
              </v-container>
            </v-flex>
          </v-card-text>
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

    <!-- produce excel with ALL DATA - emit from Navbar ($emit) -->
    <export-excel
      :data="Invoices"
      v-if="exportExcel"
      id="excel-export"
      :fields="xlsHeders"
      type="xlsx"
      name="all-data"
      title="ALL-DATA"
      footer="This is footer"
    >
    </export-excel>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { INVOICE_MOBILE_HEADERS, INVOICE_MODEL, INVOICE_WEB_HEADERS, TABLE_MODEL, BOOKS_MODEL } from "../constants/constants";

Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	// name: "invoices-list",
	data() {
		return {
			Invoices: [],
			companyName: [],
			projectName: [],
			supplierName: [],
			updateInvoice: 0,
			dialog: false,
      bookDialog: false,
			summaryDialog: false,
      summaryTotal: 0,
			summaryFilter: [],
			summaryName: "",
			summaryHeaders: [
				{ text: "Total", value: "total", align: "right" },
				{ text: "Description", value: "description", align: "right" },
				{ text: "Project", value: "project", align: "right" },
				{ text: "Date", value: "date", align: "right"},
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
			invoice: {},
			msg: "",
			fldRules: [(v) => !!v || "Field is required"],
			isLoading: true,
			itemToEdit: "",
			selectedYear: 2022,
			selectedCompany: 'ביצועים',
			start: 0,
			timeout: null,
			rowHeight: 24,
			perPage: 25,
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
          response = await apiService.get({model: INVOICE_MODEL,project: summaryItem})
          this.summaryFilter = response.data
          break;
        case 'supplier':
          // fatch all paymanets for this supplier cross years.
          response = await apiService.get({model: INVOICE_MODEL,supplier: summaryItem})
          this.summaryFilter = response.data
          break;
        case 'group':
          // fatch all paymanets for this group cross years.
          response = await apiService.get({model: INVOICE_MODEL,group: summaryItem})
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
      const response = await apiService.get({ model: BOOKS_MODEL,
                                              // record_id:item.excelRecID,
                                              asmacta1: item.invoiceId,
                                              year: item.year,
                                              company: item.company});
      this.bookInfo = response.data;
      this.bookDialog = true;
    },
		async retrieveInvoices() {
			this.isLoading = true;
			const response = await apiService.get({
				model: INVOICE_MODEL,
				year: this.selectedYear,
			});
			if (response && response.data) {
				this.Invoices = response.data;
				this.isLoading = false;
			}
		},

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.get({ table_id, model: TABLE_MODEL });
				if (response) {
					this[tableName] = response.data.map((code) => code.description);
				}
			} catch (error) {
				console.log(error);
			}
		},

		refreshList() {
			this.retrieveInvoices();
			// this.currInvoice = this.Invoices[0];
			// this.currentIndex = -1;
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
			if (window.confirm(`Are you sure you want to merge record_id with excelRecID ?`)) {
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

		saveInvoice: async function () {
			try {
				const response = await apiService.create(this.invoice, {
					model: INVOICE_MODEL,
				});
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

		async editInvoice() {
			// this is called from the update dialog
			try {
				const response = await apiService.update(
					this.updateInvoice,
					this.invoice,
					{ model: INVOICE_MODEL }
				);
				if (response) {
					this.refreshList();
					this.clearForm();
					this.updateInvoice = 0;
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

		async editOne(item) {
			if (item._id) {
				this.updateInvoice = item._id;
				const response = await apiService.getById(item._id, { model: INVOICE_MODEL });
				if (response && response.data) {
					this.invoice = response.data;
				}
				this.dialog = true;
			}
		},

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
	},

	async mounted() {
		this.retrieveInvoices();
		await this.loadTable(1, "companyName");
		await this.loadTable(2, "projectName");
		await this.loadTable(3, "supplierName");
		this.$root.$on("addNewRow", () => {
			this.dialog = true;
			this.updateInvoice = 0;
			this.invoice = {};
		});
		this.$root.$on("yearChange", (year) => {
			this.selectedYear = year;
		});
		// this.$root.$on("onSearch", (search) => {
		// 	this.search = search;
		// });
		this.$root.$on("removeAllItems", () => {
			setTimeout(100);
			this.removeAllInvoices();
		});
		this.$root.$on("downloadExcel", () => {
			const excel = document.getElementById("excel-export");
			this.exportExcel = true;
			if (excel) {
				excel.click();
				setTimeout(() => {
				this.exportExcel = false;
				}, 1000);
			}
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
	},
};
</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
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
  width: 110% !important;
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
</style>
