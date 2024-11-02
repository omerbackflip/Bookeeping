<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="revenueHeaders"
          :items="revenueList"
          :search="search"
          @click:row="updateRevenue"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          dense>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Count - {{revenueList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <v-spacer></v-spacer>
              <v-btn @click="updateRevenue()" small class="mt-3">
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								Add 
							</v-btn>

              <export-excel
                :data="revenueList"
                type="xlsx"
                name="all-revenues"
                title="All Revenues"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>

            </v-toolbar>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <span> {{ item.amount ? item.amount.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.controls`]="{ item }">
            <td @click.stop>
              <v-btn class="ml-1" @click="deleteRevenue(item._id)" x-small>
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </td>
					</template>
         </v-data-table>
      </v-flex>

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
import { REVENUE_MODEL, loadTable } from "../constants/constants";

Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	components: { RevenueForm, ConfirmDialog },
	data() {
		return {
      loadTable,
			invoices: [],
			revenueList: [],
			projectList: [],
			dialog: false,
			revenueHeaders: [
				{ text: "Remark", value: "remark", class: "hdr-styles", align: "right" },
				{ text: "Date", value: "date", class: "hdr-styles", align: "right" },
				{ text: "Amount", value: "amount", class: "hdr-styles", align: "right" },
				{ text: "Invoice", value: "invoiceId", class: "hdr-styles", align: "right" },
				{ text: "PaymentType", value: "paymentType", class: "hdr-styles", align: "right" },
				{ text: "Description", value: "description", class: "hdr-styles", align: "right" },
				{ text: "FlatId", value: "flatId", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
				{ text: '', value: 'controls' },
			],
			search: "",
			headers: [],
      expanded: [],
      revenueItem: {},
      dateModal : false,
			isLoading: false,
		};
	},

	methods: {
		async getRevenues() {
      this.isLoading = true
      const response = await apiService.getMany({model: REVENUE_MODEL});
      if (response.data) {
				this.revenueList = response.data; // put all revenueList data in revenueList
			}
      this.isLoading = false
		},

    // get Revenue data before open dialog for edit
		async getRevenueForEdit(item) {
      this.revenueItem = {}
			item.total ? this.revenueItem.project = item.project : this.revenueItem = item; 
      this.revenueItem.date = moment(this.revenueItem.date).format('YYYY-MM-DD');
			this.dialog = true;
    },

    async updateRevenue(payment) {
      let isNewPayment = false
      if (payment) {
        null
      } else {
        isNewPayment = true
        payment = {date: new Date()};
      }
      await this.$refs.revenueForm.open(payment, isNewPayment);
      this.getRevenues();
		},

    async deleteRevenue(id) {
			try {
				if(id) {
					if(await this.$refs.confirm.open( "Confirm", "Are you sure to delete this Revenue?")){
						let params = {model:REVENUE_MODEL, id:id}
						await apiService.deleteOne(params)
            this.getRevenues();
					}
				}
			} catch (error) {
				console.log(error);		
			}
		},
	},

	async mounted() {
    this.projectList = (await loadTable(2)).map((code) => code.description)
    this.getRevenues();
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

.expanded-datatable{
	width: 100%;
  margin: 12px;
  border: 5px solid #98e983;
	cursor: pointer;
}

.v-toolbar__title {
    font-size: 1rem;
    white-space: pre-line;
}

</style>
