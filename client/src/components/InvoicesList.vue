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
          :show-expand="true"
          :single-expand="true"
        >

		<template v-slot:top>
			<v-toolbar flat>
				<v-toolbar-title>All Invoices</v-toolbar-title>
				<v-spacer></v-spacer>
			</v-toolbar>
		</template>
          <!-- :expanded.sync="expanded" -->
          <template v-slot:[`item.actions`]="{ item }">
            <div :class="isMobile() ? 'd-grid' : ''">
              <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon>
              <v-icon small @click="deleteOne(item.id, item.description)"
                >mdi-delete</v-icon
              >
            </div>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
            <span @click="projectSummary(item.project)" v-if="isMobile()">
              {{ item.project }}</span
            >
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on">
                  {{ item.total ? item.total.toLocaleString() : "" }}</span
                >
              </template>
              <span
                >{{ item.pratim }} -
                {{ Number(item.record_schum).toLocaleString() }} -
                {{ item.cust_lname }}</span
              >
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
              <span>
                {{ item.amount ? item.amount.toLocaleString() : "" }}</span
              >
              <span @click="supplierSummary(item.supplier)" v-if="isMobile()">
                {{ item.supplier }}</span
              >
            </div>
          </template>
          <template v-slot:[`item.supplier`]="{ item }">
            <span @click="supplierSummary(item.supplier)" class="summary">
              {{ item.supplier }}</span
            >
          </template>
          <template v-slot:[`item.project`]="{ item }">
            <span @click="projectSummary(item.project)" class="summary">
              {{ item.project }}</span
            >
          </template>
          <template v-slot:[`item.group`]="{ item }">
            <span @click="groupSummary(item.group)" class="summary">
              {{ item.group }}</span
            >
          </template>
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
            <td v-else :colspan="headers.length">
              {{ item.pratim }} - {{ item.record_schum }} -
              {{ item.cust_lname }}
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
                  <v-col cols="12" sm="6" md="4">
                    <v-combobox
                      v-model="invoice.company"
                      :items="companyName"
                      label="Company"
                      dense
                    ></v-combobox>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-combobox
                      v-model="invoice.project"
                      :items="projectName"
                      label="Project"
                      dense
                    ></v-combobox>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.description"
                      label="Description"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.amount"
                      type="number"
                      label="Amount"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.vat"
                      type="number"
                      label="Vat"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.year"
                      type="number"
                      label="Year"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.total"
                      type="number"
                      label="Total"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.group"
                      type="number"
                      label="Group"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-dialog
                      ref="dialog"
                      :return-value.sync="invoice.date"
                      persistent
                      width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="invoice.date"
                          label="Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          required
                        >
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="invoice.date" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dialog = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          text
                          color="primary"
                          @click="$refs.dialog.save(invoice.date)"
                          >OK</v-btn
                        >
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-combobox
                      v-model="invoice.supplier"
                      :items="supplierName"
                      label="Supplier"
                      dense
                    ></v-combobox>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.invoiceId"
                      label="Invoice Id"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.excelRecID"
                      label="ExcelRecID"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="invoice.remark"
                      label="Remark"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="updateInvoice ? editInvoice() : saveInvoice()">
              {{ updateInvoice ? "-Update-" : "-Add-" }}
            </v-btn>
            <v-btn v-show="!updateInvoice" class="mx-3" @click="clearForm"
              >Clear</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- ----------------------- -->

      <!-- Summary dialog for supplier/Project/Group -->
      <v-dialog v-model="supplierDialog" max-width="600px">
        <v-card>
          <v-card-text class="margin-card">
            <v-flex>
              <v-container class="grey lighten-2 elevation-3">
                <export-excel
                  :data="supplierFilter"
                  :fields="xlsHeders"
                  type="xlsx"
                  :name="suppName"
                  :title="suppName"
                  :footer="this.supplierTotal.toLocaleString()"
                  class="mt-3"
                >
                  <h5 style="text-align: center">
                    {{ suppName }} - {{ this.supplierTotal.toLocaleString() }}
                    <v-btn small class="btn btn-danger">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </h5>
                </export-excel>
                <v-data-table
                  :headers="summaryHeaders"
                  :items="supplierFilter"
                  disable-pagination
                  hide-default-footer
                  :item-class="itemRowBackground"
                  mobile-breakpoint="350"
                  fixed-header
                  class="elevation-3"
                  dense
                >
                  <template v-slot:[`item.total`]="{ item }">
                    <span>
                      {{ item.total ? item.total.toLocaleString() : "" }}</span
                    >
                  </template>
                </v-data-table>
              </v-container>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="projectDialog" max-width="600px">
        <v-card>
          <v-card-text class="margin-card">
            <v-flex>
              <v-container class="grey lighten-2 elevation-3">
                <export-excel
                  :data="projectFilter"
                  :fields="xlsHeders"
                  type="xlsx"
                  :name="projName"
                  :title="projName"
                  :footer="this.projectTotal.toLocaleString()"
                  class="mt-3"
                >
                  <h5 style="text-align: center">
                    {{ projName }} - {{ this.projectTotal.toLocaleString() }}
                    <v-btn small class="btn btn-danger">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </h5>
                </export-excel>
                <v-data-table
                  :headers="summaryHeaders"
                  :items="projectFilter"
                  disable-pagination
                  hide-default-footer
                  :item-class="itemRowBackground"
                  mobile-breakpoint="350"
                  fixed-header
                  class="elevation-3"
                  dense
                >
                  <template v-slot:[`item.total`]="{ item }">
                    <span>
                      {{ item.total ? item.total.toLocaleString() : "" }}</span
                    >
                  </template>
                </v-data-table>
              </v-container>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="groupDialog" max-width="600px">
        <v-card>
          <v-card-text class="margin-card">
            <v-flex>
              <v-container class="grey lighten-2 elevation-3">
                <export-excel
                  :data="groupFilter"
                  :fields="xlsHeders"
                  type="xlsx"
                  :name="groupName.toLocaleString()"
                  :title="groupName"
                  :footer="this.groupTotal.toLocaleString()"
                  class="mt-3"
                >
                  <h5 style="text-align: center">
                    {{ groupName }} - {{ this.groupTotal.toLocaleString() }}
                    <v-btn small class="btn btn-danger">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </h5>
                </export-excel>
                <v-data-table
                  :headers="summaryHeaders"
                  :items="groupFilter"
                  disable-pagination
                  hide-default-footer
                  :item-class="itemRowBackground"
                  mobile-breakpoint="350"
                  fixed-header
                  class="elevation-3"
                  dense
                >
                  <template v-slot:[`item.total`]="{ item }">
                    <span>
                      {{ item.total ? item.total.toLocaleString() : "" }}</span
                    >
                  </template>
                </v-data-table>
              </v-container>
            </v-flex>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!--------------------------------->
    </v-layout>
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
import { INVOICE_MOBILE_HEADERS, INVOICE_MODEL, INVOICE_WEB_HEADERS, TABLE_MODEL } from "../constants/constants";

Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	// components: {AddInvoice},
	// name: "invoices-list",
	data() {
		return {
			Invoices: [],
			currInvoice: null,
			currentIndex: -1,
			companyName: [],
			projectName: [],
			supplierName: [],
			// expanded: [],
			updateInvoice: 0,
			dialog: false,
			supplierDialog: false,
			projectDialog: false,
			groupDialog: false,
			supplierTotal: 0,
			supplierFilter: [],
			suppName: "",
			projectTotal: 0,
			projectFilter: [],
			projName: "",
			groupTotal: 0,
			groupFilter: [],
			groupName: "",
			summaryHeaders: [
				{ text: "Total", value: "total", align: "right" },
				{ text: "Description", value: "description", align: "right" },
				{ text: "Project", value: "project", align: "right" },
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
			invoice: {
				id: null,
				company: "",
				project: "",
				description: "",
				published: false,
				amount: null,
				vat: null,
				total: null,
				group: "",
				date: null,
				supplier: "",
				invoiceId: "",
				remark: "",
				excelRecID: null,
				year: null,
			},
			msg: "",
			fldRules: [(v) => !!v || "Field is required"],
			isLoading: true,
			itemToEdit: "",
			selectedYear: 2022,
			start: 0,
			timeout: null,
			rowHeight: 24,
			perPage: 25,
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

		supplierSummary(supplier) {
			this.suppName = supplier;
			this.supplierFilter = this.Invoices.filter(
				(supp) => supp.supplier === supplier
			);
			this.supplierTotal = 0;
			for (let i = 0; i < this.supplierFilter.length; i++) {
				this.supplierTotal += this.supplierFilter[i].total;
			}
			if (!this.dialog) {
				this.supplierDialog = true;
			}
		},

		projectSummary(project) {
			this.projName = project;
			this.projectFilter = this.Invoices.filter(
				(supp) => supp.project === project
			);
			this.projectTotal = 0;
			for (let i = 0; i < this.projectFilter.length; i++) {
				this.projectTotal += this.projectFilter[i].total;
			}
			if (!this.dialog) {
				this.projectDialog = true;
			}
		},

		groupSummary(group) {
			this.groupName = group;
			this.groupFilter = this.Invoices.filter((supp) => supp.group === group);
			this.groupTotal = 0;
			for (let i = 0; i < this.groupFilter.length; i++) {
				this.groupTotal += this.groupFilter[i].total;
			}
			if (!this.dialog) {
				this.groupDialog = true;
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
					this.refreshList();
				}
			}
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

		loadTable: async function (table_id, key) {
			try {
				const response = await apiService.get({ table_id, model: TABLE_MODEL });
				if (response) {
					this[key] = response.data.map((code) => code.description);
				}
			} catch (error) {
				console.log(error);
			}
		},

		refreshList() {
			this.retrieveInvoices();
			this.currInvoice = this.Invoices[0];
			this.currentIndex = -1;
		},

		async removeAllInvoices() {
			if (window.confirm(`Are you sure you want to delete all items of year ${this.selectedYear} ?`)) {
				const response = await apiService.deleteAll({model: INVOICE_MODEL,year: Number(this.selectedYear),});
				if (response) {
					this.refreshList();
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

		async editOne(id) {
			// this is called from the edit button on the table
			// this.$router.push({ name: "invoice-details", params: { id: id } });
			if (id) {
				this.updateInvoice = id;
				const response = await apiService.getById(id, { model: INVOICE_MODEL });
				if (response && response.data) {
					this.invoice = response.data;
				}
				this.dialog = true;
			}
		},

		async updateOne(item) {
			await apiService.update(
				item.id,
				{ published: item.published },
				{ model: INVOICE_MODEL }
			);
			this.itemToEdit = "";
		},

		setEdit(item) {
			this.itemToEdit = item._id;
			setTimeout(() => {
				document.getElementById(`itemEdit-${item._id}`).focus();
			}, 1);
		},

		//Background of row if added to Book table
		itemRowBackground(item) {
			let classes = item.pratim ? "bg-green" : "";
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
		this.$root.$on("onSearch", (search) => {
			this.search = search;
		});
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
		this.isLoading = false;
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
  font-size: 10px !important;
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
  /* margin-top: 5px !important;
  margin-bottom: -30px; */
}

.mt-4 {
  margin-top: 15px !important;
}

.table-margin {
  margin-top: 29px;
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
