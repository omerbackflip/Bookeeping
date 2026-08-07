<template>
  <div class="supplier-balance-page">
    <v-container fluid>
      <v-card outlined class="balance-panel">
        <v-card-title class="balance-panel-title">
          <v-text-field
            v-model="search"
            clearable
            label="Search"
            single-line
            hide-details
            dense
            class="mx-4"
          ></v-text-field>
          <date-interval-filter @change="dateInterval = $event" />
          <v-spacer />
          <div class="balance-heading">
            <span>ביצועים - כרטסת ספקים</span>
          </div>
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

          <template v-slot:[`item.code`]="{ item }">
            <span>{{ item.code ? item.code : '' }}</span>
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

      <balance-details-dialog
        v-model="detailDialog"
        :selected-row="selectedSummaryRow"
        :rows="detailRows"
      />
    </v-container>
  </div>
</template>

<script>
import moment from 'moment';
import { BOOKS_MODEL, TABLE_IDS, TABLE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';
import BalanceDetailsDialog from './Common/BalanceDetailsDialog.vue';
import DateIntervalFilter from './Common/DateIntervalFilter.vue';

export default {
  name: 'SupplierBalance',
  components: {
    BalanceDetailsDialog,
    DateIntervalFilter,
  },
  data() {
    return {
      tableRows: [],
      bookRows: [],
      selectedSummaryRow: null,
      detailRows: [],
      detailDialog: false,
      isLoading: false,
      search: '',
      dateInterval: { from: null, to: null },

      summaryHeaders: [
        { text: 'Company', value: 'company', class: 'balance-header' },
        { text: 'Code', value: 'code', class: 'balance-header', width: '90px' },
        { text: 'Supplier', value: 'description', class: 'balance-header', align: 'right' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'balance-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'balance-header' },
        { text: 'balance', value: 'balance', class: 'balance-header' },
      ],

    };
  },

  computed: {
    filteredBookRows() {
      return this.bookRows.filter(this.isBookInDateInterval);
    },

    summaryRows() {
      return this.tableRows
        .map((tableRow) => {
          const code = Number(tableRow.table_code);
          const matchingBooks = this.filteredBookRows.filter((bookRow) => Number(bookRow.cust_id) === code);
          const schumZchut = this.sumField(matchingBooks, 'schum_zchut');
          const schumHova = this.sumField(matchingBooks, 'schum_hova');

          return {
            code,
            description: tableRow.description,
            company: this.getCompanyLabel(matchingBooks),
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
          table_id: TABLE_IDS.SUPPLIERS,
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

      this.detailRows = this.filteredBookRows
        .filter((bookRow) => Number(bookRow.cust_id) === summaryRow.code)
        .sort((a, b) => new Date(b.asmchta_date) - new Date(a.asmchta_date));

      this.detailDialog = true;
    },

    sumField(items, field) {
      return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
    },

    isBookInDateInterval(bookRow) {
      if (!this.dateInterval.from && !this.dateInterval.to) {
        return true;
      }
      const recordDate = moment(bookRow.asmchta_date);
      if (!recordDate.isValid()) {
        return false;
      }
      const afterFrom = !this.dateInterval.from || recordDate.isSameOrAfter(this.dateInterval.from);
      const beforeTo = !this.dateInterval.to || recordDate.isSameOrBefore(this.dateInterval.to);
      return afterFrom && beforeTo;
    },

    formatNumber(value) {
      return (Number(value) || 0).toLocaleString();
    },

    getCompanyLabel(items) {
      const companies = [...new Set(items.map((item) => item.company).filter(Boolean))];
      if (!companies.length) {
        return '';
      }
      if (companies.length === 1) {
        return companies[0];
      }
      const sorted = companies.slice().sort();
      return sorted.join('/');
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
