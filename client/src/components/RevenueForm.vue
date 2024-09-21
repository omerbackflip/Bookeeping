<template>
    <v-dialog v-model="dialog" width="500" :style="{ zIndex: options.zIndex }" @keydown.esc="cancel">
        <v-card class="hebrew">
            <v-card-title class="text-h5 grey lighten-2">
                {{newRevenue ? 'New' : 'Update'}} Revenue
            </v-card-title>
            <div class="field-margin" v-show="showMessage">
                {{message}}
            </div>
            <v-text-field class="field-margin" v-model="revenue.project" label="Project"></v-text-field>
            <v-text-field class="field-margin" v-model="revenue.flatId" label="FlatID"></v-text-field>
            <v-text-field class="field-margin" v-model="revenue.description" label="Description"></v-text-field>
            <v-text-field class="field-margin" v-model="revenue.paymentType" label="Payment Type"></v-text-field>
            <v-text-field class="field-margin" v-model="revenue.invoiceId" label="Invoice"></v-text-field>
            <v-text-field class="field-margin" v-model="revenue.amount" label="Amount"></v-text-field>
            <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="revenue.date" persistent width="290px">
                <template v-slot:activator="{ on, attrs }">
                <v-text-field class="field-margin" v-model="revenue.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                </v-text-field>
                </template>
                <v-date-picker v-model="revenue.date" scrollable>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                <v-btn text color="primary" @click="$refs.dialog.save(revenue.date)"> OK </v-btn>
                </v-date-picker>
            </v-dialog>
            <v-text-field class="field-margin" v-model="revenue.remark" label="Remark"></v-text-field>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
                <v-btn :disabled = "!revenue.project" color="primary" text @click="submitRevenue()"> Submit </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { REVENUE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import Vue from "vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
    name: "revenue-form",
    data() {
        return {
            revenue: {},
			dialog: false,
            resolve: null,      // What is this for ?
			showMessage: false,
            newRevenue: false,
			message: '',
            options: {
                color: "grey lighten-3",
                width: 500,
                zIndex: 200,
            },
            dateModal : false,
        };
    },
    methods: {
        async submitRevenue() {
			try {
				if(this.newRevenue) {
					await apiService.create(this.revenue , {model:REVENUE_MODEL});
				} else {
					await apiService.update(this.revenue._id , this.revenue , {model:REVENUE_MODEL});
				}
                this.showMessage = true;
                setTimeout(() => {
                    this.dialog = false;
                    this.showMessage = false;
                    this.resolve(true);
                }, 600);

			} catch (error) {
				console.log(error);
			}
		},

        open(revenue, newRevenue) {
            this.newRevenue = newRevenue;
            this.revenue = newRevenue 
                ? {revenue: '' , budget: 0 , suppliers: []} 
                : {...revenue       };
            this.revenue.date = moment(this.revenue.date).format('YYYY-MM-DD');
            this.dialog = true;
            return new Promise((resolve) => {
                this.resolve = resolve;
            });
        },
    },
    mounted(){

    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}

.v-text-field{input 
  {
    color: blue;
  }
}

.hebrew {
    direction: rtl;
}
</style>