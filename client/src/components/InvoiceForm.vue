<template>
      <div>
        <v-dialog v-model="dialogInvForm" >
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ invoice._id ? "Update" : "Add New" }}</span>
              <v-spacer></v-spacer>
              <v-checkbox v-model="invoice.published" label="נפרע"></v-checkbox>
              <v-spacer></v-spacer>
              <v-btn v-show="invoice._id" @click="copyToNew"> Copy </v-btn>
              <!-- <v-btn @click="openModal()">Iframe</v-btn> -->
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
                    <v-col cols="6" class="no-padding">
                      <label>Invoice</label>
                      <div v-if="!invoice.link" class="invoice-box">
                        <v-text-field disabled  placeholder="Upload Invoice">
                          <template v-slot:prepend>
                              <v-icon x-small>mdi-link-variant</v-icon>
                          </template>
                        </v-text-field>
                        <v-btn x-small @click="openCameraDialog" class="ml-1">
                          <v-icon x-small>mdi-camera</v-icon>
                        </v-btn>
                        <v-btn x-small @click="loadPickerApi()" class="ml-1">
                          <v-icon x-small>mdi-google-drive</v-icon>
                        </v-btn>
                      </div>
                      <span v-else>
                        <v-text-field v-model="invoice.link" label="Link" @focus="$event.target.select()" :disabled="false" readonly>
                          <template v-slot:append>
                            <v-icon @click="clickToView(invoice.link)">mdi-eye-outline</v-icon>
                            <v-icon @click="deleteLink">mdi-delete</v-icon>
                          </template>
                          <template v-slot:prepend>
                            <v-icon @click="copyToClipboard(invoice.link)">mdi-content-copy</v-icon>
                          </template>
                        </v-text-field>
                      </span>
                    </v-col>
                    <v-col cols="6">
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
                    <v-col cols="12" class="hebrew">
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
                              <v-dialog ref="dateDialog" v-model="dateModal" :return-value.sync="inv.date" persistent width="290px">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="inv.date" label="תאריך" readonly v-bind="attrs" v-on="on">
                          </v-text-field>
                        </template>
                        <v-date-picker @input="onDateChange" v-model="inv.date" scrollable>
                          <v-spacer></v-spacer>
                          <v-btn text color="primary" @click="dateModal = false"> Cancel </v-btn>
                          <v-btn text color="primary" @click="$refs.dateDialog.save(inv.date)"> OK </v-btn>
                        </v-date-picker>
                      </v-dialog>
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
          <!-- <div v-if="isModalOpen" class="modal">
            <div class="modal-content">
              <button class="close-btn" @click="closeModal">X</button>
              <iframe :src="iframeSrc" width="800" height="800"></iframe>
            </div>
          </div> -->
          <modal-dialog ref="modalDialog"/>

        </v-dialog>
        <CameraForm
          :dialogCam.sync="dialogCam"
          :invoice="invoice"
        />
      </div>
</template>

<script>
import { INVOICE_MODEL, loadTable, VAT_PERCENTAGE } from "@/constants/constants";
import apiService from "@/services/apiService";
import specificService from "@/services/specificServiceEndPoints";
import { checkGoogleStatus } from "@/utils/commonService";
import GooglePicker from 'google-drive-picker';
import CameraForm from "./camForm.vue";
import Vue from "vue";
import moment from "moment";
import modalDialog from './Common/InvoiceModal.vue';
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});

let gapi = window.gapi;
export default {
    name: "invoice-form",
    components:{ CameraForm, modalDialog },
    data() {
      return {
        loadTable,
        showDrive:false,
        dialogCam:false,
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
        selectedFile:null,
        dateModal : false,
        invoiceID: 0,
        companyName: [], // need to fatch refdata
        projectName: [], // remark
        supplierName: [], 
        invoice: [],
        // isModalOpen: false, 
        iframeSrc: '', 
        folderId:localStorage.getItem('folderId'),
        token:localStorage.getItem('googleAccessToken'),
        developerKey:localStorage.getItem('developerKey'),
      };
    },

    methods: {
      openCameraDialog(){
        this.dialogCam = true;
      },

      async copyToClipboard(link) {
        var fileview = `https://docs.google.com/file/d/${link}/preview?usp=drivesdk`
          await navigator.clipboard.writeText(fileview);
      },

      async clickToView(link) {
        var fileview = `https://docs.google.com/file/d/${link}/preview?usp=drivesdk`
        await this.$refs.modalDialog.open(fileview);
        // this.filelink = fileview;    
        // this.iframeSrc = fileview;
        // this.isModalOpen = true;    
      },

      deleteLink(){
          this.invoice.link = null;
      },

      open(invoice, isNewInvoice) {
        this.isNewInvoice = isNewInvoice;
        this.invoice = invoice 
        this.invoice.date = moment(this.invoice.date).format('YYYY-MM-DD'); // to allow using the DATE Dialog
        this.invoice.payments.map((item) => {
          item.date = moment(item.date).format('YYYY-MM-DD')
        })
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

      onDateChange() {
        this.invoice.year = new Date((this.invoice.date)).getFullYear();
      },

      removePaymentRec(index) {
        this.invoice.payments.splice(index, 1);
      },

      // openModal() {
      //   this.iframeSrc = this.invoice.link; // Set iframe source
      //   this.isModalOpen = true; // Show modal
      // },

      // closeModal() {
      //   this.isModalOpen = false; // Hide modal
      //   this.iframeSrc = ''; // Clear iframe source
      // },

      loadPickerApi() {
        if (gapi) {
          gapi.load("picker", { callback: this.createPicker });
        } else {
          console.error("Google API not initialized");
        }
      },

      // openDrive() {
      //   this.createPicker();  // Open the picker directly
      // },

      async createPicker() {
        const token = this.token;  // Use the saved access token directly
        if (!token) {
          console.error('Access token is missing!');
          return;
        }
        const response = await checkGoogleStatus();
        console.log("connecting....");
        if (response.data.connected) {
          this.token = response.data.access_token;
        }
        const picker = new google.picker.PickerBuilder()
                          .addView(
                            new google.picker.DocsView(google.picker.ViewId.DRIVE)
                              .setParent(this.folderId)
                              .setIncludeFolders(true)
                          )
                          .setOAuthToken(token)
                          .setDeveloperKey(this.developerKey)
                          .setCallback(this.pickerCallback)
                          .build();
        picker.setVisible(true);
      },

      pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
          const fileId = data.docs[0].id;
          this.invoice.link = fileId;
          const group = this.invoice.group;
          this.invoice.group = 22;
          this.invoice.group = group;
        }
      },
    },
    
    async mounted(){
      this.companyName = (await loadTable(1)).map((code) => code.description)
      this.projectName = (await loadTable(2)).map((code) => code.description)
      this.supplierName = (await loadTable(3)).map((code) => code.description)
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

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  /* width: 200;
  height: 600; */
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  /* z-index: 1000; */
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}
.invoice-box{
  display: flex;
  align-items: center;
}
</style>