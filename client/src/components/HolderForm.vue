<template>
      <!-- Add New/Update row dialog -->
      <v-dialog v-model="dialogHolderForm" width="600">
        <v-card class="hebrew">
          <v-card-title>
            <span class="text-h5">{{ holder._id ? "Update" : "Add New" }}</span>
          </v-card-title>
          <v-card-text style="padding: 0px;">
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="2">
                    <v-text-field :value="String(holder.flatId).padStart(2, '0')" @input="val => holder.flatId = Number(val)" label="דירה" disabled/>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="holder.holderName" label="שם הדייר" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.phone" label="טלפון" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="holder.signPrice" label="מחיר בחתימה" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model="holder.email" label="email" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="holder.signDate" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="holder.signDate" label="תאריך חתימה" readonly v-bind="attrs" v-on="on">
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="holder.signDate" scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dateDialog.save(holder.signDate)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="12" class="no-padding hebrew">
                    <v-textarea v-model="holder.remark" label="הערה" auto-grow rows="1" @focus="$event.target.select()"></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <v-row class="mx-0">
            <v-col cols="12" md="6" class="px-2">
              <div class="payments-wrapper">
                <div class="d-flex justify-space-between flex-row-reverse align-center px-4">
                  <v-btn @click="updatePayment()" class="primary" x-small><v-icon small >mdi-plus</v-icon></v-btn>
                  <span>תשלומי דירה - {{ totalHomePayments ? totalHomePayments.toLocaleString() : ''}}</span>
                </div>
                <v-list two-line class="hebrew">
                  <v-list-item-group>
                      <v-list-item v-for="(payment) in homePayments" :key="payment._id">
                          <v-list-item-content @click="updatePayment(payment)">
                            <v-list-item-subtitle>{{ payment.description }} - {{ payment.amount ? payment.amount.toLocaleString() :'' }} - חשבונית {{  payment.invoiceId }}</v-list-item-subtitle>
                            <v-list-item-subtitle>{{ payment.remark || '-' }}</v-list-item-subtitle>
                            <v-divider class="ma-0" color="black"></v-divider>
                          </v-list-item-content>
                      </v-list-item>
                  </v-list-item-group>
                </v-list>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="px-2">
              <div class="payments-wrapper">
                <div class="d-flex justify-space-between flex-row-reverse align-center px-4">
                  <v-btn @click="updatePayment()" class="primary" x-small><v-icon small>mdi-plus</v-icon></v-btn>
                  <span>שינויי דיירים - {{ totalChangePayments ? totalChangePayments.toLocaleString() : ''}}</span>
                </div>
                <v-list two-line class="hebrew">
                  <v-list-item-group>
                      <v-list-item v-for="(payment) in changePayments" :key="payment._id">
                          <v-list-item-content @click="updatePayment(payment)">
                            <v-list-item-subtitle>{{ payment.description }} - {{ payment.amount ? payment.amount.toLocaleString() :'' }} - חשבונית {{  payment.invoiceId }}</v-list-item-subtitle>
                            <v-list-item-subtitle>{{ payment.remark || '-' }}</v-list-item-subtitle>
                            <v-divider class="ma-0" color="black"></v-divider>
                          </v-list-item-content>
                      </v-list-item>
                  </v-list-item-group>
                </v-list>
              </div>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveHolder()" :loading="isLoading">
              {{ holder._id ? "Update" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <!-- <v-icon color="red" @click="deleteOne(holder._id, holder.description, 'holderModel')">mdi-delete</v-icon> -->
            <v-icon color="red" @click="dialogHolderForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
        <revenue-form ref="revenueForm"/>
      </v-dialog>
</template>

<script>
import { HOLDER_MODEL, REVENUE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";
import RevenueForm from './RevenueForm.vue';
import Vue from "vue";
import moment from "moment";
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
    name: "holder-form",
    components: { RevenueForm },
    data() {
      return {
        dialogHolderForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewHolder: false,
        message: '',
        options: {
          color: "grey lighten-3",
          width: 500,
          zIndex: 200,
        },
        dateModal : false,
        datePayment : false,
        invoiceID: 0,
        flatList: [], // need to fatch refdata
        projectName: [],
        supplierName: [],
        holder: [],
      };
    },

    methods: {
      open(holder, isNewHolder) {
        this.isNewHolder = isNewHolder;
        this.holder = holder 
        this.dialogHolderForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      async saveHolder() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewHolder)  {
            response = await apiService.create(this.holder, {model: HOLDER_MODEL});
          } else {
            response = await apiService.updateEntity({_id: this.holder._id}, {...this.holder}, { model: HOLDER_MODEL });
            if (this.holder.payments) {
              this.holder.payments.forEach(async (item) => {
                // await apiService.update(item._id, item, { model: REVENUE_MODEL, upsert: true}); //upsert = true so in case of new payment to create new payment
                await apiService.updateEntity(
                  { _id: item._id },        // filter (יכול להיות גם לפי שדה אחר)
                  item,                     // data (השדות שצריך לעדכן)
                  { model: REVENUE_MODEL, upsert: true } // query params
                );
              }) 
            }
          } 
          if (response) {
            this.dialogHolderForm = false;
            this.isLoading =  false;
            this.resolve(true);
          }
        } catch (error) {
          this.msg = JSON.stringify(error.message);
          setTimeout(() => {
            this.msg = "";
          }, 3000);
          console.log(error);
          this.isLoading = false
        }
      },

      async deleteOne(id, description) { // this delete only from REVENUE_MODEL (no need to delete from HOLDER_MODEL)
        if (window.confirm(`Are you sure you want to delete this item ? ` + description)) {
          const response = await apiService.deleteOne({model: REVENUE_MODEL,id});
          if (response) {
            this.dialogHolderForm = false;
          }
        }
      },

      clearForm() {
        this.$refs.form.reset();
      },

      async updatePayment(payment) {
        let isNewPayment = false
        if (payment) {
          null
        } else {
          isNewPayment = true
          payment = { project: this.holder.project, 
                      flatId: this.holder.flatId,
                      date: new Date()};
        }
        await this.$refs.revenueForm.open(payment, isNewPayment);
      },
    },

    async mounted(){

    },

    computed: {
      homePayments() {
        return this.holder.payments ? this.holder.payments.filter(payment => payment.paymentType === "תשלומי דירה") : null;
      },
      totalHomePayments() {
        return this.homePayments ? this.homePayments.reduce((total, payment) => total + (payment.amount || 0), 0) : null;
      },
      changePayments() {
        return this.holder.payments ? this.holder.payments.filter(payment => payment.paymentType === "שינויי דיירים") : null;
      },
      totalChangePayments() {
        return this.changePayments ? this.changePayments.reduce((total, payment) => total + (payment.amount || 0), 0) : null;
      },
    }
};
</script>

<style scoped>

.field-margin{
	margin: 12px;
}

.padding-date{
  padding-left: 0px !important ;
  padding-right: 0px !important ;
}

.v-input--checkbox {
  margin-top: 0px !important;
}
.payments-wrapper{
    border: 3px solid #85a7ff;
    margin-left: 5px !important;
    margin-right: 5px !important;
}

.hebrew {
  direction: rtl;
  text-align-last: right;
}
</style>