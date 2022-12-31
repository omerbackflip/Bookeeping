<template>
  <div class="list row">
    <v-layout row wrap>
      <v-flex>

        <v-data-table
          :headers="headers"
          :items="books"
          :search="search"
          @click:row="rowClicked"
          disable-pagination
          hide-default-footer
          fixed-header
          height="80vh"
          class="elevation-3 table-margin"
          no-data-text="No data available for current selected year!"
          :loading="isLoading"
        >

		<template v-slot:top>
			<v-toolbar flat>
				<v-toolbar-title>Book keeping list - {{selectedYear}} - {{books.length.toLocaleString() }} </v-toolbar-title>
				<v-spacer></v-spacer>		
			</v-toolbar>
		</template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon>
            <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
          </template>
          <template v-slot:[`item.asmchta_date`]="{ item }">
            <span> {{ item.asmchta_date | formatDate }}</span>
          </template>
          <template v-slot:[`item.record_schum`]="{ item }">
            <span>
              {{
                item.record_schum ? item.record_schum.toLocaleString() : ""
              }}</span
            >
          </template>
          <template v-slot:[`item.schum_hova`]="{ item }">
            <span>
              {{
                item.schum_hova ? item.schum_hova.toLocaleString() : ""
              }}</span
            >
          </template>
          <template v-slot:[`item.schum_zchut`]="{ item }">
            <span>
              {{
                item.schum_zchut ? item.schum_zchut.toLocaleString() : ""
              }}</span
            >
          </template>
        </v-data-table>
      </v-flex>
    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import { BOOKS_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	name: "booking-list",
	data() {
		return {
			books: [],
			currInvoice: null,
			currentIndex: -1,
			search: "",
			headers: [
				{ text: "company", value: "company", class: "" },
				{ text: "asmchta_date", value: "asmchta_date", class: "" },
				{ text: "record_id", value: "record_id", class: "" },
				{ text: "year", value: "year", class: "" },
				{ text: "record_schum", value: "record_schum", class: "" },
				{ text: "pratim", value: "pratim", class: "" },
				{ text: "asmacta1", value: "asmacta1", class: "" },
				{ text: "schum_hova", value: "schum_hova", class: "" },
				{ text: "schum_zchut", value: "schum_zchut", class: "" },
				{ text: "cust_lname", value: "cust_lname", class: "" },
				{ text: "cust_fname", value: "cust_fname", class: "" },
				{ text: "bs_item_name", value: "bs_item_name", class: "" },
				{
					text: "bs_group_name",
					value: "bs_group_name",
					class: "",
				},
				{
					text: "Act.",
					value: "actions",
					sortable: false,
					class: "",
				},
			],
			book: {
				id: null,
				asmchta_date: "",
				record_id: null,
				record_schum: null,
				pratim: "",
				asmacta1: null,
				schum_hova: null,
				schum_zchut: null,
				cust_lname: "",
				cust_fname: "",
				bs_item_name: "",
				bs_group_name: "",
			},
			fldRules: [(v) => !!v || "Field is required"],
			isLoading: true,
			selectedYear: 2022,
			value: 50,
		};
	},

	methods: {
		rowClicked(row) {
			this.currInvoice = row;
		},

		async deleteOne(id) {
			if (window.confirm("Are you sure you want to delete one item ?")) {
				const response = await apiService.deleteOne({ model: BOOKS_MODEL, id });
				if (response) {
					this.refreshList();
				}
			}
		},

		async retrieveBooks() {
			this.isLoading = true;
			const response = await apiService.get({
				model: BOOKS_MODEL,
				year: this.selectedYear,
			});
			if (response && response.data) {
				this.books = response.data;
			}
			this.isLoading = false;
		},

		refreshList() {
			this.retrieveBooks();
			this.currInvoice = null;
			this.currentIndex = -1;
		},

		removeAllBooks() {
			if (window.confirm(`Are you sure you want to delete all items of ${this.selectedYear} ?`)) {
				apiService.deleteAll({ model: BOOKS_MODEL, year: this.selectedYear })
				.then(() => {
					this.refreshList();
				})
				.catch((e) => {
					console.log(e);
				});
			}
		},

		editOne(id) {
			this.$router.push({ name: "invoice-details", params: { id: id } });
		},
	},

	mounted() {
		this.retrieveBooks();
		// this.isLoading = false;
		this.$root.$on("yearChange", (year) => {
			this.selectedYear = year;
		});
		this.$root.$on("onSearchBooking", (search) => {
			this.search = search;
		});
		this.$root.$on("removeAllBooksItems", () => {
			this.removeAllBooks();
		});
	},

	watch: {
		selectedYear() {
			this.retrieveBooks();
		},
	},
};
</script>

<style>
.list {
  text-align: right;
  max-width: auto;
  margin: auto;
}

.table-margin{
	margin-top: 29px !important;
}
</style>
