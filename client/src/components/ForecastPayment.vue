<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="summaryHeaders"
          :items="paymentList"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :loading="isLoading"
          loading-text="Loading... Please wait"
          loader-height="20"
          @click:row="getInvoiceForEdit"
          dense>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title> Forecast Payments Count - {{paymentList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <export-excel
                :data="paymentList"
                type="xlsx"
                name="all-payments"
                title="All Payments"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
              <v-btn  x-small class="mx-3">All</v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`item.payment`]="{ item }">
            <span> {{ item.payment ? item.payment.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.redeemed`]="{ item }">
            <td @click.stop>
              <v-checkbox v-model="item.redeemed" @click="updateOne(item)"></v-checkbox>
            </td>
          </template>
         </v-data-table>
      </v-flex>

      <confirm-dialog ref="confirm"/>
      <invoice-form ref="invoiceForm"/>


    </v-layout>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
import apiService from "../services/apiService";
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import ConfirmDialog from './Common/ConfirmDialog.vue';
import { INVOICE_MODEL } from "../constants/constants";
import invoiceForm from "./InvoiceForm.vue"

Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	name: "forecastPayment",
	components: { ConfirmDialog, invoiceForm },
	data() {
		return {
			invoices: [],
			paymentList: [],
			selectedCompany: 'ביצועים',
			dialog: false,
			summaryHeaders: [
				{ text: "Company", value: "company", class: "hdr-styles", align: "right" },
				{ text: "Supplier", value: "supplier", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
				{ text: "Date", value: "date", class: "hdr-styles", align: "right" },
				{ text: "Invoice", value: "invoiceId", class: "hdr-styles", align: "right" },
				{ text: "checkID", value: "checkID", class: "hdr-styles", align: "right" },
				{ text: "Payment", value: "payment", class: "hdr-styles", align: "right" },
				{ text: "Redeemed", value: "redeemed", class: "hdr-styles", align: "right" },
			],
			invoice: [],
			isLoading: false,
		};
	},

	methods: {
		async getPayments() {
      this.isLoading = true
      this.paymentList = []
      const response = await apiService.getMany({model: INVOICE_MODEL, company: this.selectedCompany});
      if (response.data) {
        response.data.filter((item) => {
            return (item.payments.length > 0) // filter only invoices with payments
        }).map((item1) => {
          item1.payments.forEach((item2) => { // forEach invoice pickup the payments
            this.paymentList.push({_id:item1._id, supplier:item1.supplier, project: item1.project, company: item1.company, invoiceId: item1.invoiceId,
                                  checkID:item2.checkID, date:item2.date, payment:item2.payment, // and structure the paymentList
                                  redeemed:item2.redeemed, pymt_id:item2._id})  // the need for pymt_id is for update toggle in this screen
          })
        })
        // now weed-out the duplicate payments with same chechID
        this.paymentList = this.paymentList.filter((value, index, self) =>
            index === self.findIndex((t) => ( t.checkID === value.checkID))
        )
        this.paymentList = this.paymentList.sort((a,b) => { // now sort the list by redeeme date
          if (a.date > b.date) {
            return -1
          }
        })
			}
      this.isLoading = false
		},

    // get invoice data before call to invoiceForm for edit
		async getInvoiceForEdit(item) {
			if (item._id) {
				const response = await apiService.getById(item._id, { model: INVOICE_MODEL });
				if (response && response.data) {
					this.invoice = response.data; 
          this.invoice.date = moment(this.invoice.date).format('YYYY-MM-DD');
          if(this.invoice.payments && this.invoice.payments.length) {
            this.invoice.payments.map(payment => {
              payment.date = moment(payment.date).format('YYYY-MM-DD')
            });
          }
				}
        await this.$refs.invoiceForm.open(this.invoice, false);
        this.getPayments()
			}
		},

    // called @click on toggle "redeemed" field
		async updateOne(item) {
      let pymt_id = item.pymt_id
      let payment = {checkID: item.checkID, payment: item.payment, date: item.date, redeemed: item.redeemed}
      await SpecificServiceEndPoints.updatePaymentInInvoice(pymt_id, payment) ;
    },
  },


	mounted() {
		this.getPayments();
    this.$root.$on("companyChange", (company) => {
			this.selectedCompany = company;
		});

	},
	
  watch: {
    selectedCompany() {
			this.getPayments();
		},
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

.v-toolbar__title {
    font-size: 1rem;
    white-space: pre-line;
}

</style>
