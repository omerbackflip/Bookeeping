<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="projectList"
          :search="search"
          @click:row="clickRow"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          dense
          single-expand
          :expanded.sync="expanded"
          item-key="project">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Total Invoices - {{invoices.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.project`]="{ item }">
            <td @click.stop class="link" >
              <span @click="projectInvoices (item)"> {{ item.project }}</span>
            </td>
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
            <span> {{(item.payedList || '').length || ''}}</span>
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
                @click:row="updateRevenue"
                class="expanded-datatable">
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-btn @click="updateRevenue(item)" x-small> Add Revenue</v-btn>
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

      <!-- <v-sparkline :value= graph line-width="1" auto-draw show-labels label-size="3" type="bar"></v-sparkline> -->
      <apexchart type="bar" width="1000" height="1050" :options="chartOptions" :series="series"></apexchart>
      <revenue-form ref="revenueForm"/>
      <confirm-dialog ref="confirm"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import RevenueForm from './RevenueForm.vue';
import ConfirmDialog from './Common/ConfirmDialog.vue';
import { INVOICE_MODEL, REVENUE_MODEL, SUMMARY_PROJECT_WEB_HEADERS, SUMMARY_PROJECT_MOBILE_HEADERS, loadTable } from "../constants/constants";
import { isMobile } from '../constants/constants';
// import ApexCharts from 'apexcharts';
import VueApexCharts from 'vue-apexcharts'
Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	name: "project-summary",
	components: { RevenueForm, ConfirmDialog, apexchart: VueApexCharts},
	data() {
		return {
      isMobile,
      loadTable,
			invoices: [],
			revenues: [],
			projectList: [],
			dialog: false,
      graph: [],

      revHeaders: [
				{ text: "Amount", value: "amount", align: "right" },
				{ text: "Date", value: "date", align: "right" },
				// { text: "Description", value: "description", align: "right" },
				{ text: "Invoice", value: "invoiceId", align: "right" },
      ],
			search: "",
			headers: [],
      expanded: [],
      revenueItem: {},
      dateModal : false,
      isLoading : false,
      series: [],
        // {
        //   name: 'הוצאות',
        //   data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
        // }, {
        //   name: 'הכנסות',
        //   data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
        // }],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 800
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '100%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          // categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          title: {
            text: 'פרויקטים'
          }
        },
        yaxis: {
          title: {
            text: '$K'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " K"
            }
          }
        }
      },
 



		};
	},

          /* eslint-disable */
	methods: {
		async mainSummary() {
      this.isLoading = true
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
      let proj = this.projectList.map((item) =>{
        return (item.project)
      })
      this.chartOptions = ({...this.chartOptions, xaxis:{categories: proj}})

      let revs = this.projectList.map((item) =>{
        return (Math.round(item.revenue/100)/10)
      })
      let exps = this.projectList.map((item) =>{
        return (Math.round(item.total/100)/10)
      })
      this.series = [{name:'הכנסות', data: revs},{name:'הוצאות', data:exps}]
      this.isLoading = false
		},

    projectInvoices(row) {
			this.$router.push({ name: "invoicesList", params: { project: row.project } });
		},

    clickRow(item,event) {
      if(event.isExpanded) {
        const index = this.expanded.findIndex(i => i === item);
        this.expanded.splice(index, 1)
      } else {
        this.expanded = [];
        this.expanded.push(item);
      }
    },

    async updateRevenue(item) {
      // if item.payedList exsit - this is called for create new Revevue
			let newRevenue = item.payedList ? true : false;
			await this.$refs.revenueForm.open(item, newRevenue);
      this.mainSummary();
		},

		getHeaders() {
			if (this.isMobile()) {
				return SUMMARY_PROJECT_MOBILE_HEADERS;
			} else {
				return SUMMARY_PROJECT_WEB_HEADERS;
			}
		},
	},

	async mounted() {
    this.projectList = (await loadTable(2)).map((code) => {
      return {project: code.description}
    })
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

.link {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
  float: right;
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

.v-toolbar__title {
    font-size: 1rem;
    white-space: pre-line;
}

.expanded-datatable{
	width: 100%;
  margin-bottom: 12px;
  border: 5px solid #98e983;
	cursor: pointer;
}

.text {
  font-size: 3px;
}
</style>
