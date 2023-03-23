<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
			:headers="headers"
			:items="books"
			:search="search"
			disable-pagination
			hide-default-footer
			fixed-header
			height="80vh"
			class="elevation-3 mt-0"
			no-data-text="No data available for current selected year!"
			:loading="isLoading"
			loading-text="Loading... Please wait"
			loader-height="20"
			mobile-breakpoint="0"
			dense>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title> {{selectedYear}} - {{books.length.toLocaleString()}} </v-toolbar-title>
					<v-spacer></v-spacer>
					<v-text-field v-model="search" label="Search" class="mx-4 sreach-width" clearable></v-text-field>
					<v-spacer></v-spacer>
					<v-btn x-small @click="removeAllBooks()">delete</v-btn>
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
				<span>{{ item.record_schum ? item.record_schum.toLocaleString() : "" }}</span>
			</template>
			<template v-slot:[`item.schum_hova`]="{ item }">
				<span>{{ item.schum_hova ? item.schum_hova.toLocaleString() : "" }}</span>
			</template>
			<template v-slot:[`item.schum_zchut`]="{ item }">
				<span>{{ item.schum_zchut ? item.schum_zchut.toLocaleString() : "" }}</span>
			</template>
			<template v-slot:[`item.cust_lname`]="{ item }">
				<span @click="getSummary('cust', item.cust_lname)" class="summary">{{ item.cust_lname }}</span>
			</template>
		</v-data-table>
      </v-flex>
      <!-- SummaryDialog for cust_name -->
      <v-dialog v-model="summaryDialog" max-width="600px">
        <v-card>
            <v-flex>
                <v-data-table
					:headers="summaryHeaders"
					:items="summaryFilter"
					disable-pagination
					hide-default-footer
					mobile-breakpoint="350"
					fixed-header
					class="elevation-3"
					height="80vh"
					dense>
					<template v-slot:top>
						<v-toolbar>
						<v-spacer />
							<export-excel
								:data="summaryFilter"
								type="xlsx"
								:name="summaryName"
								:title="summaryName"
								:footer="summaryTotal.toLocaleString()"
								class="mt-3">
								<v-toolbar-title>
									{{ summaryName }} - {{summaryTotal.toLocaleString() }}
									<v-btn small class="btn btn-danger">
										<v-icon>mdi-download</v-icon>
									</v-btn>
								</v-toolbar-title>
							</export-excel>
						<v-spacer />
						</v-toolbar>
					</template>				  				
					<template v-slot:[`item.record_schum`]="{ item }">
						<span>{{ item.record_schum ? item.record_schum.toLocaleString() : "" }}</span>
					</template>
					<template v-slot:[`item.asmchta_date`]="{ item }">
						<span> {{ item.asmchta_date | formatDate }}</span>
					</template>
                </v-data-table>
            </v-flex>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import excel from "vue-excel-export";
// import VueVirtualTable from 'vue-virtual-table'
import apiService from '../services/apiService';
import { BOOKS_MODEL } from '../constants/constants';


Vue.use(excel);
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

export default {
	name: "booking-list",
	// components: { VueVirtualTable },
	data() {
		return {
			books: [],
			currInvoice: null,
			currentIndex: -1,
			search: "",
			headers: [
				{ text: "company", 		value: "company", class: "red white--text"	},
				{ text: "Asmchta date", value: "asmchta_date", class: "red white--text"	},
				{ text: "record_id", 	value: "record_id", class: "red white--text"},
				{ text: "year", 		value: "year", 		class: "red white--text"},
				{ text: "record_schum", value: "record_schum", class: "red white--text"},
				{ text: "pratim", 		value: "pratim", 	class: "red white--text"},
				{ text: "asmacta1", 	value: "asmacta1", 	class: "red white--text"},
				{ text: "schum_hova", 	value: "schum_hova", 	class: "red white--text"},
				{ text: "schum_zchut", 	value: "schum_zchut", 	class: "red white--text"},
				{ text: "cust_lname", 	value: "cust_lname", 	class: "red white--text"},
				{ text: "cust_fname", 	value: "cust_fname",class: "red white--text"},
				{ text: "bs_item_name", value: "bs_item_name",class: "red white--text"},
				{ text: "bs_group_name",value: "bs_group_name",class: "red white--text"},
			],
			// headers: [
			// 	{ name: "company", 		prop: "company", 		actionName: 'company', 	searchable: true },
			// 	{ name: "Asmchta date", prop: "_action", 		actionName: 'asmchta_date'},
			// 	{ name: "record_id", 	prop: "record_id", 								numberFilter: true},
			// 	{ name: "year", 		prop: "year", 									searchable: true},
			// 	{ name: "record_schum", prop: "record_schum", 		actionName: 'record_schum', numberFilter: true},
			// 	{ name: "pratim", 		prop: "pratim", 								searchable: true },
			// 	{ name: "asmacta1", 	prop: "asmacta1", 								searchable: true },
			// 	{ name: "schum_hova", 	prop: "_action", 		actionName: 'schum_hova', },
			// 	{ name: "schum_zchut", 	prop: "_action", 		actionName: 'schum_zchut', },
			// 	{ name: "cust_lname", 	prop: "_action", 		actionName: 'cust_lname', },
			// 	{ name: "cust_fname", 	prop: "cust_fname", 							searchable: true },
			// 	{ name: "bs_item_name", prop: "bs_item_name", 							searchable: true },
			// 	{ name: "bs_group_name",prop: "bs_group_name",							searchable: true,},
			// 	{ name: "Action", 		prop: "_action", 		actionName: "actionCommon" },
			// ],
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
			selectedYear: '2023',
			selectedCompany: 'ביצועים',
			value: 50,
			searchedBooks: [],
			summaryDialog: false,
			summaryTotal: 0,
			summaryFilter: [],
			summaryName: "",
			summaryHeaders: [
				{ text: "Schum", value: "record_schum", align: "right" },
				{ text: "Pratim", value: "pratim", align: "right" },
				{ text: "Asmacta1", value: "asmacta1", align: "right" },
				{ text: "Date", value: "asmchta_date", align: "right"},
			],
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
			this.selectedYear = this.$route.query.year || this.selectedYear;
			this.isLoading = true;
			const response = await apiService.getMany({
				model: BOOKS_MODEL,
				year: this.selectedYear,
				company: this.selectedCompany,
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

		onSearch(search) {
			if(!search) {
				this.searchedBooks = [];
				return;
			}
			this.books.forEach(book => {
				return Object.keys(book).map(key => {
					if(book[key] === search) {
						this.searchedBooks.push(book);
					} 
				});
			});
		},
		async getSummary(summaryField, summaryItem) {
			let response = "";
			switch (summaryField) {
				case 'cust':
					// fatch all paymanets for this project cross years.
					response = await apiService.getMany({model: BOOKS_MODEL, cust_lname: summaryItem})
					this.summaryFilter = response.data
					break;
				default : break;
			}
			this.summaryName = summaryItem.replaceAll(".","-");
			this.summaryTotal = this.summaryFilter.reduce((currentTotal, item) =>{
				return item.record_schum + currentTotal
			}, 0)
			if (!this.summaryDialog) {
				this.summaryDialog = true;
			}
		},
	},

	mounted() {
		this.retrieveBooks();
		this.$root.$on("yearChange", (year) => {
			this.selectedYear = year;
		});
		this.$root.$on("companyChange", (company) => {
			this.selectedCompany = company;
		});
	},

	watch: {
		selectedYear() {
			this.retrieveBooks();
		},
		selectedCompany() {
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
	margin-top: 20px !important;
}

.summary {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
}
.mt-2{
	margin-top: 20px;
}
.fab-button-placement{
	bottom: 70px !important;
    right: 45px !important;
}
/* .header-line{
    background: blue !important;
	color: grey !important;
} */
.hdr-styles{
	background: blue !important;
	color: white !important;
}
.sreach-width {
  width: 4rem;
}
</style>
