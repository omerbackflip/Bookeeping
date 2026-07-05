<template>
  <div class="supplier-balance-page">
    <v-container fluid>
      <v-card outlined class="balance-panel">
        <v-card-title class="balance-panel-title">
          <div class="balance-heading">
            <span>Supplier Balance</span>
          </div>
          <v-text-field
            v-model="search"
            clearable
            label="Search"
            single-line
            hide-details
            dense
            class="mx-4"
          ></v-text-field>
          <v-spacer />
          ({{ summaryRows.length }})
        </v-card-title>

        <v-data-table
          :headers="summaryHeaders"
          :items="summaryRows"
          :search="search"
          :loading="isLoading"
          dense
          fixed-header
          height="78vh"
          mobile-breakpoint="0"
          hide-default-footer
          disable-pagination
          class="balance-table summary-table"
          loading-text="Loading... Please wait"
          @click:row="openDetails"
        >
          <template v-slot:no-data>
            <span>No supplier rows</span>
          </template>

          <template v-slot:[`item.schum_zchut`]="{ item }">
            <span>{{ formatNumber(item.schum_zchut) }}</span>
          </template>

          <template v-slot:[`item.schum_hova`]="{ item }">
            <span>{{ formatNumber(item.schum_hova) }}</span>
          </template>

          <template v-slot:[`item.balance`]="{ item }">
            <span :class="{ negative: item.balance < 0 }">{{ formatNumber(item.balance) }}</span>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="detailDialog" max-width="1200px">
        <v-card outlined class="balance-panel">
          <v-card-title class="balance-panel-title">
            <div class="balance-heading">
              <span v-if="selectedSummaryRow">{{ selectedSummaryRow.description }} - {{ selectedSummaryRow.code }}</span>
            </div>
            <v-text-field
              v-if="selectedSummaryRow"
              v-model="detailSearch"
              clearable
              label="Search"
              single-line
              hide-details
              dense
              class="mx-4"
            ></v-text-field>
            <v-spacer />
            <v-chip
              v-if="selectedSummaryRow"
              small
              color="primary"
              text-color="white"
            >
              schum_zchut: {{ formatNumber(selectedSummaryRow.schum_zchut) }}
            </v-chip>

            <v-chip
              v-if="selectedSummaryRow"
              small
              color="primary"
              text-color="white"
            >
              schum_hova: {{ formatNumber(selectedSummaryRow.schum_hova) }}
            </v-chip>

            <v-chip
              v-if="selectedSummaryRow"
              small
              :color="selectedSummaryRow.balance < 0 ? 'error' : 'primary'"
              text-color="white"
            >
              Balance: {{ formatNumber(selectedSummaryRow.balance) }}
            </v-chip>
            <v-spacer />
            ({{ detailRows.length }})
            <export-excel
              v-if="detailRows.length"
              :data="$formatDataForExport(detailRows)"
              type="xlsx"
              :name="`${selectedSummaryRow.description} - ${selectedSummaryRow.code}`"
              :title="`${selectedSummaryRow.description} - ${selectedSummaryRow.code}`"
              footer="Exported from Book App"
            >
              <v-btn icon small color="primary">
                <v-icon small>mdi-download</v-icon>
              </v-btn>
            </export-excel>
            <v-btn icon small @click="detailDialog = false">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="detailHeaders"
            :items="detailRows"
            :search="detailSearch"
            dense
            fixed-header
            height="70vh"
            mobile-breakpoint="0"
            hide-default-footer
            disable-pagination
            class="balance-table book-table"
          >
            <template v-slot:no-data>
              <span>No matching book records</span>
            </template>

            <template v-slot:[`item.asmchta_date`]="{ item }">
              <span>{{ formatDate(item.asmchta_date) }}</span>
            </template>

            <template v-slot:[`item.schum_zchut`]="{ item }">
              <span>{{ formatNumber(item.schum_zchut) }}</span>
            </template>

            <template v-slot:[`item.schum_hova`]="{ item }">
              <span>{{ formatNumber(item.schum_hova) }}</span>
            </template>

            <template v-slot:[`item.record_schum`]="{ item }">
              <span :class="{ negative: item.record_schum < 0 }">{{ formatNumber(item.record_schum) }}</span>
            </template>
          </v-data-table>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import moment from 'moment';
import { BOOKS_MODEL, TABLE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';

const SUPPLIERS_TABLE_ID = 3;

export default {
  name: 'SupplierBalance',
  data() {
    return {
      tableRows: [],
      bookRows: [],
      selectedSummaryRow: null,
      detailRows: [],
      detailDialog: false,
      isLoading: false,
      search: '',
      detailSearch: '',

      summaryHeaders: [
        { text: 'Code', value: 'code', class: 'balance-header', width: '90px' },
        { text: 'Supplier', value: 'description', class: 'balance-header', align: 'right' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'balance-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'balance-header' },
        { text: 'balance', value: 'balance', class: 'balance-header' },
      ],

      detailHeaders: [
        { text: 'company', value: 'company', class: 'balance-header' },
        { text: 'year', value: 'year', class: 'balance-header' },
        { text: 'asmchta_date', value: 'asmchta_date', class: 'balance-header' },
        { text: 'asmacta1', value: 'asmacta1', class: 'balance-header' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'balance-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'balance-header' },
        { text: 'pratim', value: 'pratim', class: 'balance-header', align: 'right' },
        { text: 'record_schum', value: 'record_schum', class: 'balance-header' },
      ],
    };
  },

  computed: {
    summaryRows() {
      return this.tableRows
        .map((tableRow) => {
          const code = Number(tableRow.table_code);
          const matchingBooks = this.bookRows.filter((bookRow) => Number(bookRow.cust_id) === code);
          const schumZchut = this.sumField(matchingBooks, 'schum_zchut');
          const schumHova = this.sumField(matchingBooks, 'schum_hova');

          return {
            code,
            description: tableRow.description,
            schum_zchut: schumZchut,
            schum_hova: schumHova,
            balance: schumHova - schumZchut,
          };
        })
        .sort((a, b) => a.code - b.code);
    },
  },

  mounted() {
    this.retrieveData();
  },

  methods: {
    async retrieveData() {
      this.isLoading = true;

      try {
        const tableResponse = await apiService.clientGetEntities(TABLE_MODEL, {
          table_id: SUPPLIERS_TABLE_ID,
        });

        this.tableRows = tableResponse.data || [];

        const supplierCodes = [...new Set(this.tableRows.map((item) => Number(item.table_code)))];

        if (!supplierCodes.length) {
          this.bookRows = [];
          return;
        }

        const bookResponse = await apiService.clientGetEntities(BOOKS_MODEL, {
          filter: JSON.stringify({ cust_id: { $in: supplierCodes } }),
        });

        this.bookRows = bookResponse.data || [];
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
    },

    openDetails(summaryRow) {
      this.selectedSummaryRow = summaryRow;
      this.detailSearch = '';

      this.detailRows = this.bookRows
        .filter((bookRow) => Number(bookRow.cust_id) === summaryRow.code)
        .sort((a, b) => new Date(b.asmchta_date) - new Date(a.asmchta_date));

      this.detailDialog = true;
    },

    sumField(items, field) {
      return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
    },

    formatDate(value) {
      return value ? moment(String(value)).format('DD/MM/YYYY') : '';
    },

    formatNumber(value) {
      return (Number(value) || 0).toLocaleString();
    },
  },
};
</script>

<style scoped>
.supplier-balance-page {
  direction: rtl;
  text-align: right;
}

.balance-panel {
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
}

.balance-panel-title {
  min-height: 56px;
  padding: 12px 16px;
  gap: 8px;
  direction: rtl;
}

.balance-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.balance-heading span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.balance-table {
  direction: rtl;
  text-align-last: right;
}

.book-table {
  border-top: 0;
}

::v-deep .balance-header {
  background: #eef4ff !important;
  color: #1e3a5f !important;
  font-weight: 700 !important;
}

::v-deep .balance-table tbody tr {
  cursor: pointer;
}

::v-deep .balance-table tbody tr:hover {
  background: #f3f8ff !important;
}

::v-deep .book-table table {
  min-width: 860px;
}

.negative {
  background-color: lightcoral;
  color: white;
}

@media (max-width: 960px) {
  .balance-panel-title {
    align-items: flex-start;
  }
}
</style>
