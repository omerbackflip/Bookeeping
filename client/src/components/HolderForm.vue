<template>
      <!-- Add New/Update row dialog -->
      <v-dialog v-model="dialogHolderForm" >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ holder._id ? "Update" : "Add New" }}</span>
            <v-spacer></v-spacer>
            <v-btn v-show="holder._id" @click="copyToNew"> Copy </v-btn>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="4">
                    <v-text-field v-model="holder.flatId" label="דירה" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.holderName" label="שם הדייר" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.phone" label="טלפון" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field v-model="holder.signPrice" label="מחיר בחתימה" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="4">
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
          <div class="payments-wrapper">
              <h6>Payments</h6>
              <v-container>
                  <div v-for="(payment, i) in holder.payments" :key="i" class="text-fields-row">
                      <v-row>
                          <v-col cols="3">
                              <v-text-field label="Invoice ID" v-model="payment.invoiceId" @focus="$event.target.select()"></v-text-field>
                          </v-col>
                          <v-col cols="3">
                              <v-text-field label="Payment" v-model="payment.amount" @focus="$event.target.select()"></v-text-field>
                          </v-col>
                          <v-col cols="4" class="padding-date">
                            <!-- <div class="input-container"> -->
                              <!-- <input v-model="payment.date" type="date" /> -->
                              <v-text-field label="date" v-model="payment.date" @focus="$event.target.select()"></v-text-field>
                            <!-- </div> -->
                          </v-col>
                          <v-col cols="2" style="margin-top: 0px; padding-top: 0px;">
                              <!-- <v-checkbox v-model="payment.redeemed"></v-checkbox> -->
                              <v-btn @click="removePaymentRec(i)" class="error" x-small><v-icon small>mdi-delete</v-icon></v-btn>
                          </v-col>
                      </v-row>
                  </div>                    
                  <v-btn @click="addPaymentRow" class="primary" x-small><v-icon small >mdi-plus</v-icon></v-btn>					
              </v-container>
          </div>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveHolder()" :loading="isLoading">
              {{ holder._id ? "Update" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(holder._id, holder.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialogHolderForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import { HOLDER_MODEL } from "../constants/constants";
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
    name: "holder-form",
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
        console.log(this.holder)
        this.dialogHolderForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      copyToNew() {
        this.isNewHolder = true
        this.holder._id = null
      },

      async saveHolder() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewHolder)  {
            response = await apiService.create(this.holder, {model: HOLDER_MODEL});
          } else {
            response = await apiService.update(this.holder._id, this.holder, { model: HOLDER_MODEL });
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

      async deleteOne(id, description) {
        if (window.confirm(`Are you sure you want to delete this item ? ` + description)) {
          const response = await apiService.deleteOne({model: HOLDER_MODEL,id});
          if (response) {
            this.dialogHolderForm = false;
          }
        }
      },

      addPaymentRow() {
        this.holder.payments.push({ project: this.holder.project,
                                    flatId: this.holder.flatId,
                                    date: moment(new Date()).format('YYYY-MM-DD') });
      },

      clearForm() {
        this.$refs.form.reset();
      },

    },

    async mounted(){

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