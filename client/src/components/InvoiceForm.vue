<template>
      <!-- Add New/Update row dialogInvForm -->
      <v-dialog v-model="dialogInvForm" >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ invoice._id ? "Update" : "Add New" }}</span>
            <v-spacer></v-spacer>
            <v-btn v-show="invoice._id" @click="copyToNew"> Copy </v-btn>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-form ref="form">
                <v-row>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.company" :items="companyName" label="חברה" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.project" :items="projectName" label="פרויקט" dense></v-combobox>
                  </v-col>
                  <v-col cols="4">
                    <v-combobox v-model="invoice.supplier" :items="supplierName" label="ספק" dense></v-combobox>
                  </v-col>
                  <v-col cols="5" class="no-padding">
                    <v-text-field v-model="invoice.link" label="link" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="7" class="no-padding">
                    <v-text-field v-model="invoice.description" label="תאור" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field @input="onAmountChange" v-model="invoice.amount" label="סכום" required @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.vat" label="מע'מ" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field @input="onTotalChange" v-model="invoice.total" label="סה'כ" required @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.invoiceId" label="חשבונית" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.group" label="קובץ" required @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="invoice.date" persistent width="290px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="invoice.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                        </v-text-field>
                      </template>
                      <v-date-picker @input="onDateChange" v-model="invoice.date" scrollable>
                      <!-- <v-date-picker v-model="invoice.date" scrollable> -->
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                        <v-btn text color="primary" @click="$refs.dateDialog.save(invoice.date)"> OK </v-btn>
                      </v-date-picker>
                    </v-dialog>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.year" label="שנה" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field v-model="invoice.excelRecID" label="ExcelRecID" @focus="$event.target.select()"></v-text-field>
                  </v-col>
                  <v-col cols="12" class="no-padding hebrew">
                    <v-textarea v-model="invoice.remark" label="הערה" auto-grow rows="1" @focus="$event.target.select()"></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </v-card-text>
          <div class="payments-wrapper">
              <h6>Payments</h6>
              <v-container>
                  <div v-for="(inv, i) in invoice.payments" :key="i" class="text-fields-row">
                      <v-row>
                          <v-col cols="3">
                              <v-text-field label="checkID" v-model="inv.checkID" @focus="$event.target.select()"></v-text-field>
                          </v-col>
                          <v-col cols="3">
                              <v-text-field label="Payment" v-model="inv.payment" @focus="$event.target.select()"></v-text-field>
                          </v-col>
                          <v-col cols="4" class="padding-date">
                            <div class="input-container">
                              <input v-model="inv.date" type="date" />
                            </div>
                          </v-col>
                          <v-col cols="2" style="margin-top: 0px; padding-top: 0px;">
                              <v-checkbox v-model="inv.redeemed"></v-checkbox>
                              <v-btn @click="removePaymentRec(i)" class="error" x-small><v-icon small>mdi-delete</v-icon></v-btn>
                          </v-col>
                      </v-row>
                  </div>                    
                  <v-btn @click="addPaymentRow" class="primary" x-small><v-icon small >mdi-plus</v-icon></v-btn>					
              </v-container>
          </div>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small @click="saveInvoice()" :loading="isLoading">
              {{ invoice._id ? "Update" : "Save New" }}
            </v-btn>
            <v-btn small v-show="!invoiceID" class="mx-3" @click="clearForm"> Clear </v-btn>
            <v-spacer></v-spacer>
            <v-icon color="red" @click="deleteOne(invoice._id, invoice.description)">mdi-delete</v-icon>
            <v-icon color="red" @click="dialogInvForm = false">mdi-close-box</v-icon>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script>
import { INVOICE_MODEL, TABLE_MODEL, VAT_PERCENTAGE } from "../constants/constants";
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
    name: "invoice-form",
    data() {
      return {
        dialogInvForm: false,
        resolve: null,      // What is this for ?
        isLoading: false,
        isNewInvoice: false,
        message: '',
        options: {
          color: "grey lighten-3",
          width: 500,
          zIndex: 200,
        },
        dateModal : false,
        invoiceID: 0,
        companyName: [], // need to fatch refdata
        projectName: [],
        supplierName: [],
        invoice: [],
      };
    },

    methods: {
      open(invoice, isNewInvoice) {
        console.log(invoice)
        this.isNewInvoice = isNewInvoice;
        this.invoice = invoice 
        // this.invoice.date = moment(this.invoice.date).format('YYYY-MM-DD'); no need any more, already done when fetch from DB
        this.dialogInvForm = true;
        return new Promise((resolve) => {
          this.resolve = resolve;
        });
      },

      copyToNew() {
        this.isNewInvoice = true
        this.invoice._id = null
        this.invoice.published = false
      },

      // saveInvoice: async function () {
      async saveInvoice() {
        try {
          this.isLoading = true
          let response = ''
          if (this.isNewInvoice)  {
            response = await apiService.create(this.invoice, {model: INVOICE_MODEL});
          } else {
            response = await apiService.update(this.invoice._id, this.invoice, { model: INVOICE_MODEL });
          } 
          if (response) {
            this.dialogInvForm = false;
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
          const response = await apiService.deleteOne({model: INVOICE_MODEL,id});
          if (response) {
            this.dialogInvForm = false;
          }
        }
      },

      onAmountChange() {
        let { amount } = this.invoice;
        if(amount && amount !== 0) {
          this.invoice.vat = ((parseFloat(amount) * VAT_PERCENTAGE)/100)
          this.invoice.total = (this.invoice.vat + parseFloat(amount)).toFixed(0);
        } else {
          this.invoice.amount = 0;
          this.invoice.vat = 0;
          this.invoice.total = 0;
        }
      },

      onTotalChange() {
        let { total } = this.invoice;
        if(total && total !== 0) {
          this.invoice.amount = (parseFloat(total)/(1+VAT_PERCENTAGE/100)).toFixed(0);
          this.invoice.vat = (parseFloat(total)- this.invoice.amount).toFixed(0);
        } else {
          this.invoice.amount = 0;
          this.invoice.vat = 0;
          this.invoice.total = 0;
        }
      },

      addPaymentRow() {
        this.invoice.payments.push({ checkID: 0, payment: 0, date: moment(new Date()).format('YYYY-MM-DD') });
      },

      clearForm() {
        this.$refs.form.reset();
      },

      loadTable: async function (table_id, tableName) {
        try {
          const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
          if (response) {
            this[tableName] = response.data.map((code) => code.description);
          }
        } catch (error) {
          console.log(error);
        }
      },

      onDateChange() {
        this.invoice.year = new Date((this.invoice.date)).getFullYear();
      },

      removePaymentRec(index) {
        this.invoice.payments.splice(index, 1);
      },

    },

    async mounted(){
      await this.loadTable(1, "companyName");
      await this.loadTable(2, "projectName");
      await this.loadTable(3, "supplierName");
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