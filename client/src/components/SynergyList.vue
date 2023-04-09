<template>
    <div>
		<div class="max-height-50">
			<invoice-list v-on:lookForMatch="searchedInvoice = ($event)" />
		</div>
		<div class="max-height-50 mt-1">
			<booking-list v-on:findMatch="findedBook = ($event)" />
		</div>
		<div style="text-align: start; margin-left: 3rem;" >
			<v-btn x-small @click="updateExcelRecId"> update </v-btn>
			<td class="newWidth"> invoice: <b>{{ searchedInvoice.invoiceId}}</b> </td>
			<td class="newWidth"> description: <b>{{searchedInvoice.description}}</b> </td>
			<td class="newWidth"> Date: <b>{{ searchedInvoice.date | formatDate }}</b> </td>
			<td class="newWidth"> Amount: <b>{{ searchedInvoice.amount }}</b> </td>
			<td class="newWidth"> ExcelRecID: <b>{{ searchedInvoice.excelRecID }}</b> </td>
			<v-spacer></v-spacer>
			<td class="newWidth"> Asmacta1: <b>{{ findedBook.asmacta1 }}</b> </td>
			<td class="newWidth"> Pratim: <b>{{ findedBook.pratim }}</b> </td>
			<td class="newWidth"> Date: <b>{{ findedBook.asmchta_date | formatDate }}</b> </td>
			<td class="newWidth"> record_schum: <b>{{ findedBook.record_schum }}</b> </td>
			<td class="newWidth"> record_id: <b>{{ findedBook.record_id }}</b> </td>
		</div>
	</div>
</template>

<script>
import BookingListVue from './BookingList.vue';
import InvoicesListVue from './InvoicesList.vue';

export default {
	// name:"Synergy list",
	components: { 'invoice-list': InvoicesListVue, 'booking-list': BookingListVue },
	data() {
		return {
			searchedInvoice: '',
			findedBook: '',
		}
	},
	methods: {
		async updateExcelRecId() {
			this.searchedInvoice.excelRecID = this.findedBook.record_id;
			this.searchedInvoice.invoiceId = this.findedBook.asmacta1;
			console.log (this.searchedInvoice)
            await this.$root.$emit('invoiceUpdate',this.searchedInvoice);

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