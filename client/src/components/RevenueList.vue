<template>
  <div class="list row">
    <v-layout>
      <v-flex>
        <v-data-table
          :headers="summaryHeaders"
          :items="revenueList"
          :search="search"
          @click:row="updateRevenue"
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
              <v-toolbar-title> Total Revenues - {{revenueList.length.toLocaleString()}} </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <v-spacer></v-spacer>
              <v-btn @click="updateRevenue()" small class="mt-3">
								<v-icon class="nav-icon" small >mdi-plus</v-icon>
								Add Revenue
							</v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <span> {{ item.amount ? item.amount.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.controls`]="{ item }">
						<v-btn class="ml-1" @click="deleteRevenue(item._id)" x-small>
							<v-icon small>mdi-delete</v-icon>
						</v-btn>
					</template>
         </v-data-table>
      </v-flex>

      <!-- <v-dialog v-model="dialog" >
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
            <v-spacer></v-spacer>
            <v-icon v-show="revenueItem" color="red" >mdi-delete</v-icon>
            <v-icon color="red" @click="dialog = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog> -->

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
import { TABLE_MODEL, REVENUE_MODEL } from "../constants/constants";

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
			invoices: [],
			revenueList: [],
			projectList: [],
			dialog: false,
			summaryHeaders: [
				{ text: "Date", value: "date", class: "hdr-styles", align: "right" },
				{ text: "Amount", value: "amount", class: "hdr-styles", align: "right" },
				{ text: "Invoice", value: "invoiceId", class: "hdr-styles", align: "right" },
				{ text: "Description", value: "description", class: "hdr-styles", align: "right" },
				{ text: "Project", value: "project", class: "hdr-styles", align: "right" },
				{ text: '', value: 'controls' },
			],
			search: "",
			headers: [],
      expanded: [],
      revenueItem: {},
      dateModal : false,
		};
	},

	methods: {
		async getRevenues() {
      const response = await apiService.getMany({model: REVENUE_MODEL});
      if (response.data) {
				this.revenueList = response.data; // put all revenueList data in revenueList
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
			let newRevenue = item ? false : true;
			await this.$refs.revenueForm.open(item, newRevenue);
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
		await this.loadTable(2, "projectList");
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
</style>
