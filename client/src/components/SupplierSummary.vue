<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="supplierList"
          :search="search"
          @click:row="clickRow"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          loader-height="20"
          dense>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Total Invoices - {{invoices.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.totalExclude`]="{ item }">
            <span> {{ item.totalExclude ? item.totalExclude.toLocaleString("en",{minimumFractionDigits: 0, maximumFractionDigits: 0,}) : '' }}</span>
          </template>
          <!-- <template v-slot:[`item.totalInclude`]="{ item }">
            <span> {{ item.totalInclude ? item.totalInclude.toLocaleString() : '' }}</span>
          </template> -->
          <template v-slot:[`item.budget`]="{ item }">
            <span> {{ item.budget ? item.budget.toLocaleString() : '' }}</span>
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
import { INVOICE_MODEL, TABLE_MODEL, SUMMARY_SUPPLIER_HEADERS } from "../constants/constants";

Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	name: "supplier-summary",
	data() {
		return {
      invoices: [],
			supplierList: [],
			search: "",
			headers: [],
		};
	},

	methods: {
		async mainSummary() {
			let response = await apiService.getMany({model: INVOICE_MODEL});
			if (response.data) {
				this.invoices = response.data; // put all invoices data in invoices
        this.supplierList = this.supplierList.map((item1) => { // add to supplierList the total for each supplier
          // let totalInclude = this.invoices.filter((item2) => {
          //   return item2.supplier === item1.supplier
          // }).reduce ((currSum,item3) => {return item3.total + currSum},0)
          let totalExclude = this.invoices.filter((item2) => {
            return item2.supplier === item1.supplier
          }).reduce ((currSum,item3) => {return item3.amount + currSum},0)
          return({...item1, totalExclude:totalExclude}) // concatinate the totalSupplier
          // return({...item1, totalInclude:totalInclude, totalExclude:totalExclude}) // concatinate the totalSupplier
        })  
			}
		},  

		loadTable: async function (table_id, tableName) {
			try {
				const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
				if (response) {
					this[tableName] = response.data.map((item) => {
            return {supplier: item.description, budget: item.table_code}
          });
				}
			} catch (error) {
				console.log(error);
			}
		},

    clickRow(row) {
			this.$router.push({ name: "invoices-list", params: { supplier: row.supplier } });
    },

		getHeaders() {
      return SUMMARY_SUPPLIER_HEADERS;
		},
	},

	async mounted() {
		await this.loadTable(3, "supplierList");
		this.mainSummary();
	},
	
  watch: {

	},
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: 100%;
  margin: auto;
}
.v-toolbar__title {
    font-size: 1rem;
    direction: rtl;
    white-space: pre-wrap;
    text-align: center;
}
</style>
