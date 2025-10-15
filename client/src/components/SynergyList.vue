<template>
    <div>
		<div class="max-height-50">
			<invoice-list :showSelect=true v-on:lookForMatch="invoiceMerge = $event" />
		</div>
		<div class="max-height-50 mt-1">
			<booking-list :showSelect=true v-on:findMatch="bookMerge = $event" />
		</div>
		<div style="text-align: start; margin-left: 3rem;" >
			<v-btn v-show="invoiceMerge && bookMerge" x-small @click="updateExcelRecId"> update </v-btn>
			<td style="width: 15rem"> Date: <b>{{ invoiceMerge.date | formatDate }}</b> </td>
			<td style="width: 30rem"> description: <b>{{invoiceMerge.description}}</b> </td>
			<td style="width: 15rem"> Amount: <b>{{ invoiceMerge.amount }}</b> </td>
			<td style="width: 15rem"> invoice: <b>{{ invoiceMerge.invoiceId}}</b> </td>
			<td style="width: 15rem"> ExcelRecID: <b>{{ invoiceMerge.excelRecID }}</b> </td>
			<v-spacer></v-spacer>
			<td style="width: 15rem"> Date: <b>{{ bookMerge.asmchta_date | formatDate }}</b> </td>
			<td style="width: 30rem"> Pratim: <b>{{ bookMerge.pratim }}</b> </td>
			<td style="width: 15rem"> record_schum: <b>{{ bookMerge.record_schum }}</b> </td>
			<td style="width: 15rem"> Asmacta1: <b>{{ bookMerge.asmacta1 }}</b> </td>
			<td style="width: 15rem"> record_id: <b>{{ bookMerge.record_id }}</b> </td>
		</div>
	</div>
</template>

<script>
import BookingListVue from './BookingList.vue';
import InvoicesListVue from './InvoicesList.vue';
import { INVOICE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

export default {
	// name:"Synergy-list",
	components: { 'invoice-list': InvoicesListVue, 'booking-list': BookingListVue },
	data() {
		return {
			invoiceMerge: '',
			bookMerge: '',
		}
	},
	methods: {
		async updateExcelRecId() {
			this.invoiceMerge.excelRecID = this.bookMerge.record_id;
			this.invoiceMerge.invoiceId = this.bookMerge.asmacta1;
			// await apiService.update(this.invoiceMerge._id, this.invoiceMerge, { model: INVOICE_MODEL });
			await apiService.updateEntity(
				{ _id: this.invoiceMerge._id },  // filter
				this.invoiceMerge,               // data
				{ model: INVOICE_MODEL }         // query params
			);
            // await this.$root.$emit('invoiceUpdate',this.invoiceMerge);

		}
	}
};
</script>

<style>

.max-height-50{
	max-height: 50%;
}

div.max-height-50 > div > div > div.flex > div > div {
	height: 35vh !important;
	width: 200vh !important;
}
.newWidth {
	width: 20rem
}

</style>