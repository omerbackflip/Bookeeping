<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="summaryHeaders"
          :items="projectList"
          :search="search"
          @click:row="projectInvoices"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          loader-height="20"
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
          <template v-slot:[`item.revenue`]="{ item }">
            <span> {{ item.revenue ? item.revenue.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.balance`]="{ item }">
            <span> {{ item.revenue ? (item.revenue - item.total).toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.profit`]="{ item }">
            <span> {{ item.revenue ? ((item.revenue-item.total)/item.revenue*75).toFixed(0) + '%': '' }}</span>
          </template>
        </v-data-table>
      </v-flex>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import { INVOICE_MODEL, TABLE_MODEL, REVENUE_MODEL } from "../constants/constants";

Vue.use(excel);

export default {
	// name: "summary-list",
	data() {
		return {
			Invoices: [],
			Revenues: [],
			projectList: [],
			dialog: false,
			summaryHeaders: [
				{ text: "Profit", value: "profit", class: "hdr-styles", align: "right" },
				{ text: "Balance", value: "balance", class: "hdr-styles", align: "right" },
				{ text: "Revenue", value: "revenue", class: "hdr-styles", align: "right" },
				{ text: "Expances", value: "total", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
			],
			search: "",
			headers: [],
			invoice: [],
		};
	},

	methods: {
		async mainSummary() {
			let response = await apiService.getMany({
				model: INVOICE_MODEL,
			});
			if (response && response.data) {
				this.Invoices = response.data;
        this.projectList = this.projectList.map((item1) => {
          let totalProject = this.Invoices.filter((item2) => {
            return item2.project === item1.project
          }).reduce ((currSum,item3) => {return item3.total + currSum},0)
          return({...item1, total:totalProject})
        })  
			}
      let response1 = await apiService.getMany({
				model: REVENUE_MODEL,
			});
      if (response1 && response1.data) {
				this.Revenues = response1.data;
        this.projectList = this.projectList.map((item1) => {
          let totalRevenue = this.Revenues.filter((item2) => {
            return item2.project === item1.project
          }).reduce ((currSum,item3) => {return item3.amount + currSum},0)
          return({...item1, revenue:totalRevenue})
        })  
			}
		},

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
				if (response) {
					this[tableName] = response.data.map((item) => {
            return {project: item.description}
          });
				}
			} catch (error) {
				console.log(error);
			}
		},

    projectInvoices(row) {
			this.$router.push({ name: "invoices-list", params: { project: row.project } });
		},

	},

	async mounted() {
		await this.loadTable(2, "projectList");
		this.mainSummary();
	},
	
  watch: {

	},
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: 50%;
  margin: auto;
  cursor: pointer;
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
