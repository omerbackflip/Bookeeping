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
          single-expand
          :expanded.sync="expanded"
          item-key="project"
          show-expand>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Total Payments - {{invoices.length.toLocaleString()}} </v-toolbar-title>
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
          <template v-slot:[`item.count`]="{ item }">
            <span> {{(item.payedList.length || '')}}</span>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
							<v-data-table 
								:headers="revHeaders"
								:items="item.payedList"
								dense
								disable-pagination
								hide-default-footer
								mobile-breakpoint="0"
                @click:row="getRevenueForEdit"
                class="expanded-datatable">
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-btn @click="getRevenueForEdit(item)" x-small> Add Revenue</v-btn>
                  </v-toolbar>
                </template>
								<template v-slot:[`item.amount`]="{ item }">
									<span>{{ item.amount ? item.amount.toLocaleString() : 0 }} </span>
								</template>
                <template v-slot:[`item.date`]="{ item }">
                  <span> {{ item.date | formatDate }}</span>
                </template>
              </v-data-table>
            </td>
          </template>
        </v-data-table>
      </v-flex>

      <v-dialog v-model="dialog" >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ revenueItem._id ? "Update" : "Add New" }}</span>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="3" >
                    <v-text-field v-model="revenueItem.project" label="Project" ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="revenueItem.invoiceId" label="חשבונית" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="revenueItem.amount" label="סכום" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="revenueItem.date" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="revenueItem.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="revenueItem.date" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dialog.save(revenueItem.date)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="revenueItem.description" label="תאור" reverse></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="saveRevenue()"> {{revenueItem._id ? "Update" : "Save New"}} </v-btn>
            <!-- <v-btn small class="mx-3" @click="clearForm"> Clear </v-btn> -->
            <v-spacer></v-spacer>
            <v-icon v-show="revenueItem" color="red" >mdi-delete</v-icon>
            <v-icon color="red" @click="dialog = false">mdi-close-box</v-icon>
          </v-card-actions>
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
import { INVOICE_MODEL, TABLE_MODEL, REVENUE_MODEL } from "../constants/constants";

Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	data() {
		return {
			invoices: [],
			revenues: [],
			projectList: [],
			dialog: false,
			summaryHeaders: [
				{ text: "Count", value: "count", class: "hdr-styles", align: "right" },
				{ text: "Profit", value: "profit", class: "hdr-styles", align: "right" },
				{ text: "Balance", value: "balance", class: "hdr-styles", align: "right" },
				{ text: "Revenue", value: "revenue", class: "hdr-styles", align: "right" },
				{ text: "Expances", value: "total", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
			],
      revHeaders: [
				{ text: "Amount", value: "amount", align: "right" },
				{ text: "Date", value: "date", align: "right" },
				{ text: "Description", value: "description", align: "right" },
				{ text: "Invoice", value: "invoiceId", align: "right" },
      ],
			search: "",
			headers: [],
      expanded: [],
      revenueItem: {},
      dateModal : false,
		};
	},

	methods: {
		async mainSummary() {
			let response = await apiService.getMany({model: INVOICE_MODEL});
			if (response.data) {
				this.invoices = response.data; // put all invoices data in invoices
        this.projectList = this.projectList.map((item1) => { // add to projectList the total for each project
          let totalProject = this.invoices.filter((item2) => {
            return item2.project === item1.project
          }).reduce ((currSum,item3) => {return item3.total + currSum},0)
          return({...item1, total:totalProject}) // concatinate the totalProject
        })  
			}
      response = await apiService.getMany({model: REVENUE_MODEL});
      if (response.data) {
				this.revenues = response.data; // put all revenues data in revenues
        this.projectList = this.projectList.map((item1) => {
          let totalRevenue = this.revenues.filter((item2) => { // add to projectList the total revenue for each project
            return item2.project === item1.project
          }).reduce ((currSum,item3) => {return item3.amount + currSum},0)
          let payedList = this.revenues.filter((item4) => { // also add array of list of revenues for each project
            return item4.project === item1.project
          }).map((item5) => {
            item5.date = moment(item5.date).format('YYYY-MM-DD'); // set the date format to be readbale
            return item5
          })
          return({...item1, revenue:totalRevenue, payedList}) // concatinate the totalRevenue and list of payed projects
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

    // get Revenue data before open dialog for edit
		async getRevenueForEdit(item) {
      this.revenueItem = {}
			item.total ? this.revenueItem.project = item.project : this.revenueItem = item; 
      this.revenueItem.date = moment(this.revenueItem.date).format('YYYY-MM-DD');
			this.dialog = true;
    },

    // clearForm() {
		// 	this.$refs.form.reset();
		// },

        // this is called from the update dialog
		async saveRevenue() {
			try {
        let response = ''
        this.revenueItem._id ? 
            response = await apiService.update(this.revenueItem._id, this.revenueItem, { model: REVENUE_MODEL }) 
              : 
            response = await apiService.create( this.revenueItem, { model: REVENUE_MODEL }) 
				if (response) {
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
  max-width: 100%;
  margin: auto;
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
  cursor: pointer;
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

.expanded-datatable{
	width: 100%;
  margin: 12px;
  border: 10px solid #98e983;
	cursor: pointer;
}
</style>
