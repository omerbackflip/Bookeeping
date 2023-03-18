<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="summaryHeaders"
          :items="projectName"
          :search="search"
          @click:row="projectList"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :class="isMobile() ? 'table-margin' : 'table-margin-web'"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          item-key="_id"
          :expanded.sync="expanded"
          :show-expand="isMobile()"
          :single-expand="true"
          dense
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Total Invoices - {{Invoices.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <v-spacer></v-spacer>
            </v-toolbar>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <span> {{ item.total ? item.total.toLocaleString() : '' }}</span>
          </template>
        </v-data-table>
      </v-flex>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import { INVOICE_MODEL, TABLE_MODEL, } from "../constants/constants";

Vue.use(excel);

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	// name: "summary-list",
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
				{ text: "Total", value: "total", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
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
			selectedYear: 2022,
			selectedCompany: 'ביצועים',
      bookInfo: '',
      dateModal : false,
		};
	},

	methods: {

		isMobile() {
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				return true;
			} else {
				return false;
			}
		},

		async retrieveInvoices() {
			this.isLoading = true;
			const response = await apiService.getMany({
				model: INVOICE_MODEL,
			});
			if (response && response.data) {
				this.Invoices = response.data;
        this.projectName = this.projectName.map((item1) => {
          let totalProject = this.Invoices.filter((item2) => {
            return item2.project === item1.project
          }).reduce ((currSum,item3) => {return item3.total + currSum},0)
          return({...item1, total:totalProject})
        })  
			}
      this.isLoading = false;
		},

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
				if (response) {
					// this[tableName] = response.data.map((item) => item.description);
					this[tableName] = response.data.map((item) => {
            return {project: item.description}
          });
				}
			} catch (error) {
				console.log(error);
			}
		},

    projectList(row) {
			this.$router.push({ name: "invoices-list", params: { project: row.project } });
		},

	},

	async mounted() {
		await this.loadTable(2, "projectName");
		this.retrieveInvoices();
	},
	
  watch: {

	},
};
</script>

<style scoped>
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
    border: 10px solid #85a7ff;
    margin: 20px;
    padding: 20px;
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
.v-text-field {
  width: 4rem;
}
</style>
