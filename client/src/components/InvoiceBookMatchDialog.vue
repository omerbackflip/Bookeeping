<template>
  <div>
    <v-dialog :value="value" max-width="1250" @input="$emit('input', $event)">
      <v-card>
        <v-card-title>
          Find Book match
          <v-spacer />
          <v-text-field
            v-model="search"
            label="Search all Book rows"
            clearable
            dense
            hide-details
            class="match-search"
          />
        </v-card-title>
        <v-card-text>
          <v-alert v-if="errorMessage" type="error" dense text>{{ errorMessage }}</v-alert>
          <v-data-table
            :headers="headers"
            :items="candidates"
            :search="search"
            :loading="loading"
            item-key="book._id"
            fixed-header
            height="55vh"
            :items-per-page="25"
            @click:row="selectCandidate"
          >
            <template v-slot:[`header.book.asmacta1`]>
              <span>Asmacta - <span class="invoice-header-value">{{ invoice.invoiceId || "" }}</span></span>
            </template>
            <template v-slot:[`header.book.asmchta_date`]>
              <span>Date - <span class="invoice-header-value">{{ formatDate(invoice.date) }}</span></span>
            </template>
            <template v-slot:[`header.book.record_schum`]>
              <span>Amount - <span class="invoice-header-value">{{ formatAmount(invoice.total) }}</span></span>
            </template>
            <template v-slot:[`header.book.cust_lname`]>
              <span>Customer - <span class="invoice-header-value">{{ invoice.customer || invoice.supplier || "" }}</span></span>
            </template>
            <template v-slot:item="{ item }">
              <tr @click="selectCandidate(item)">
                <td>
                  <v-radio-group v-model="selectedBookId" hide-details class="selection-radio">
                    <v-radio :value="item.book._id" @click.stop />
                  </v-radio-group>
                </td>
                <td><v-chip x-small :color="scoreColor(item.score)" dark>{{ item.score }}</v-chip></td>
                <td>{{ item.book.asmacta1 }}</td>
                <td>{{ formatDate(item.book.asmchta_date) }}</td>
                <td>{{ formatAmount(item.book.record_schum) }}</td>
                <td>{{ item.book.pratim }}</td>
                <td>{{ item.book.cust_lname }}</td>
                <td>{{ item.book.record_id }}</td>
                <td>
                  <v-chip v-if="item.linkedInvoices.length" x-small color="warning">
                    Already linked: {{ item.linkedText }}
                  </v-chip>
                  <span v-else>Available</span>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="close">Cancel</v-btn>
          <v-btn color="primary" :disabled="!selectedCandidate" @click="useSelection">
            Use selected Book row
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import moment from "moment";
import apiService from "@/services/apiService";
import { BOOKS_MODEL, INVOICE_MODEL } from "@/constants/constants";
import { scoreBookCandidate } from "@/utils/invoiceBookMatcher";

export default {
  name: "InvoiceBookMatchDialog",
  props: {
    value: { type: Boolean, default: false },
    invoice: { type: Object, required: true }
  },
  data() {
    return {
      loading: false,
      search: "",
      candidates: [],
      selectedBookId: "",
      errorMessage: ""
    };
  },
  computed: {
    headers() {
      return [
        { text: "", value: "select", sortable: false, width: 45 },
        { text: "Score", value: "score", width: 70 },
        { text: "Asmacta", value: "book.asmacta1" },
        { text: "Date", value: "book.asmchta_date" },
        { text: "Amount", value: "book.record_schum" },
        { text: "Description", value: "book.pratim" },
        { text: "Customer", value: "book.cust_lname" },
        { text: "Record ID", value: "book.record_id" },
        { text: "Existing link", value: "linkedText", sortable: false }
      ];
    },
    selectedCandidate() {
      return this.candidates.find(candidate => candidate.book._id === this.selectedBookId) || null;
    }
  },
  watch: {
    value(open) {
      if (open) this.loadCandidates();
    }
  },
  methods: {
    async loadCandidates() {
      this.loading = true;
      this.errorMessage = "";
      this.search = "";
      this.selectedBookId = "";
      try {
        const query = { company: this.invoice.company, year: this.invoice.year };
        const responses = await Promise.all([
          apiService.clientGetEntities(BOOKS_MODEL, query),
          apiService.clientGetEntities(INVOICE_MODEL, query)
        ]);
        const books = responses[0].data || [];
        const invoices = responses[1].data || [];
        const links = invoices.reduce((map, linkedInvoice) => {
          if (linkedInvoice.excelRecID != null && linkedInvoice.excelRecID !== "") {
            const key = String(linkedInvoice.excelRecID);
            if (!map[key]) map[key] = [];
            map[key].push(linkedInvoice);
          }
          return map;
        }, {});

        this.candidates = books
          .map(book => {
            const scored = scoreBookCandidate(this.invoice, book);
            const linkedInvoices = links[String(book.record_id)] || [];
            return {
              ...scored,
              reasonsText: scored.reasons.join(" · "),
              linkedInvoices,
              linkedText: linkedInvoices
                .map(item => `${item.invoiceId || "No ID"} / ${item.supplier || "No supplier"}`)
                .join(", ")
            };
          })
          .sort((a, b) => b.score - a.score);
      } catch (error) {
        this.errorMessage = "Could not load Book candidates.";
      } finally {
        this.loading = false;
      }
    },
    selectCandidate(candidate) {
      this.selectedBookId = candidate.book._id;
    },
    useSelection() {
      if (!this.selectedCandidate) return;
      this.$emit("selected", this.selectedCandidate.book);
      this.close();
    },
    close() {
      this.$emit("input", false);
    },
    scoreColor(score) {
      if (score >= 100) return "green";
      if (score >= 65) return "orange";
      return "grey";
    },
    formatDate(value) {
      return value ? moment(value).format("DD/MM/YYYY") : "";
    },
    formatAmount(value) {
      return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "";
    }
  }
};
</script>

<style scoped>
.match-search { max-width: 330px; }
.selection-radio { margin-top: 0; padding-top: 0; }
.invoice-header-value { color: red; font-weight: bold; }
</style>
