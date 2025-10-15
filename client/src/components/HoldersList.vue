<template>
  <div class="list row hebrew">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="getHeaders()"
          :items="holdersList"
          :search="search"
          @click:row="getHolderForEdit"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :loading="isLoading"
          loader-height="20"
          dense
          single-expand
          show-expand
          :expanded.sync="expanded"
          item-key="flatId"
          :sort-by="['flatId']">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Sales - {{holdersCount}}/{{holdersList.length}} </v-toolbar-title>
              <v-spacer></v-spacer>
              Payments - {{ totalPayed.toLocaleString() }}
              <v-spacer></v-spacer>
              Total - {{ totalSales.toLocaleString() }}
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <!-- <v-spacer></v-spacer>
              <v-btn x-small @click="getHolderForEdit">
                <v-icon small>mdi-plus</v-icon>
              </v-btn> -->
            </v-toolbar>
          </template>
          <template v-slot:[`item.flatId`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ String(item.flatId).padStart(2, '0') }}</span>
          </template>
          <template v-slot:[`item.signDate`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.signDate | formatDate }}</span>
          </template>
          <template v-slot:[`item.signPrice`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.signPrice ? item.signPrice.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" style="text-align: -webkit-center;">
							<v-data-table 
								:headers="paymentHeaders"
								:items="item.payments"
								dense
								disable-pagination
								hide-default-footer
								mobile-breakpoint="0"
                @click:row="updatePament"
                class="expanded-datatable">
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-btn @click="updatePament({newPayment: true, project: item.project, flatId: item.flatId})" x-small> Add Payment</v-btn>
                  </v-toolbar>
                </template>
								<template v-slot:[`item.payment`]="{ item }">
									<span>{{ item.payment ? item.payment.toLocaleString() : 0 }} </span>
								</template>
                <template v-slot:[`item.date`]="{ item }">
                  <span> {{ item.date | formatDate }}</span>
                </template>
              </v-data-table>
            </td>
          </template>
        </v-data-table>
      </v-flex>

      <revenue-form ref="revenueForm"/>
      <!-- <confirm-dialog ref="confirm"/> -->
      <holder-form ref="holderForm"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../services/apiService";
// import ConfirmDialog from './Common/ConfirmDialog.vue';
import { HOLDER_MODEL, HOLDER_HEADERS, REVENUE_MODEL } from "../constants/constants";
import { isMobile } from '../constants/constants';
import HolderForm from './HolderForm.vue';
import RevenueForm from './RevenueForm.vue';
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	// name: "holders-list",
	components: { HolderForm, RevenueForm },
	data() {
		return {
      isMobile,
			holdersList: [],
			holdersCount: '',
			// dialog: false,

      paymentHeaders: [
				{ text: "Payment", value: "amount", align: "right" },
				{ text: "Date", value: "date", align: "right" },
				{ text: "Invoice", value: "invoiceId", align: "right" },
				{ text: "Description", value: "description", align: "right" },
				{ text: "PaymentType", value: "paymentType", align: "right" },
				{ text: "Remark", value: "remark", align: "right" },
      ],
			search: "",
			headers: [],
      expanded: [],
      dateModal : false,
      isLoading : false,
      totalPayed: 0,
      totalSales: 0,
		};
	},

          /* eslint-disable */
	methods: {
		async getHolders() {
      this.isLoading = true
      this.holdersCount = 0;
      this.totalSales = 0;
      this.totalPayed = 0;
			let response = await apiService.clientGetEntities(HOLDER_MODEL);
			if (response.data) {
				this.holdersList = response.data;
			}
      this.holdersList.forEach(async (item) => {
        if(item.holderName) {
          this.holdersCount += 1
          this.totalSales = this.totalSales + item.signPrice
          item.signDate = moment(item.signDate).format('YYYY-MM-DD');
          let payments = await apiService.clientGetEntities(REVENUE_MODEL, { project:'גדות פ"ת', flatId: item.flatId });
          if (payments && payments.data) { // there are payments for this flatId
            payments.data.forEach((item1) => {
              item1.date = moment(item1.date).format('YYYY-MM-DD');
              if (item1.paymentType === 'תשלומי דירה') this.totalPayed += item1.amount
            })
            item.payments = payments.data;
          }
        }
      })
      this.isLoading = false
		},

		getHeaders() {
			if (this.isMobile()) {
				return HOLDER_HEADERS;
			} else {
				return HOLDER_HEADERS;
			}
		},

    async getHolderForEdit(item) {
			if (item._id) { // this is update holder
			  await this.$refs.holderForm.open(item, false);
      }
      this.getHolders();
		},

    async updatePament(item) {
			await this.$refs.revenueForm.open(item);
      this.getHolders();
		},
	},

	async mounted() {
		this.getHolders();
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
	width: 70%;
  margin-bottom: 12px;
  border: 5px solid #98e983;
	cursor: pointer;
}

.text {
  font-size: 3px;
}

.hebrew {
  direction: rtl;
  /* text-align-last: right; */
}
</style>
