<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="success" v-bind="attrs" v-on="on">Add</v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">Add New Invoice</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.company" label="Company"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.description" label="Description"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.amount" label="Amount"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.vat" label="Vat"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.total" label="Total"></v-text-field>
              </v-col>              
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.group" label="Group"></v-text-field>
              </v-col>
              <!-- <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.date" label="Date"></v-text-field>
              </v-col> -->
              <v-col cols="12" sm="6" md="4" >
                <!-- <v-dialog ref="dialog" v-model="modal" :return-value.sync="invoice.date" persistent width="290px"> -->
                <v-dialog ref="dialog" :return-value.sync="invoice.date" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field 
                      v-model="invoice.date"
                      label="Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on" >
                    </v-text-field>
                  </template> 
                  <v-date-picker v-model="invoice.date" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="modal = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(invoice.date)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.supplier" label="Supplier"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="invoice.invoiceId" label="Invouce Id"></v-text-field>
              </v-col>              
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialog =false">close</v-btn>
          <v-btn color="primary" @click="saveInvoice()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TutorialDataService from "../services/TutorialDataService";
  export default {
    data () {
      return {
        invoice: {
          id:           null,
          company:      "",
          project:      "",
          description:  "",
          published:    false,
          amount:       null,
          vat:          null,
          total:        null,
          group:        "",
          date:         null,
          supplier:     "",
          invoiceId:    "",
          remark:       "",
          excelRecID:   null,
        },  
        dialog: false,
      }
    },

    methods: {
      saveInvoice() {
        var data = {
          company:      this.invoice.company,
          description:  this.invoice.description,
          amount:       this.invoice.amount,
          vat:          this.invoice.vat,
          total:        this.invoice.total,
          group:        this.invoice.group,
          date:         this.invoice.date,
          supplier:     this.invoice.supplier,
          invoiceId:    this.invoice.invoiceId,
          remark:       this.invoice.remark,
          excelRecID:   this.invoice.excelRecID,
        };
        TutorialDataService.create(data)
          .then(response => {
            this.invoice.id = response.data.id;
            console.log(response.data);
            // this.submitted = true;
          })
          .catch(e => {
            console.log(e);
          });
        this.dialog = false;
      },
      
      // newTutorial() {
      //   this.submitted = false;
      //   this.invoice = {};
      // },
    },
  }
</script>