<template>
  <div class="linked-list-page">
    <v-container fluid>
      <div class="linked-interval-toolbar">
        <date-interval-filter @change="dateInterval = $event" />
      </div>

      <v-row class="linked-content-row">
        <v-col cols="12" md="6">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading">
                <span>{{ showSalaryRows ? 'משכורות' : 'ביצועים' }}</span>
              </div>
              <v-spacer />
              <v-btn small outlined color="primary" class="salary-toggle" @click="showSalaryRows = !showSalaryRows">
                <v-icon small class="ml-1">mdi-swap-horizontal</v-icon>
                {{ showSalaryRows ? 'ביצועים' : 'משכורות' }}
              </v-btn>
              ({{ bitzuimSummaryRows.length }})
            </v-card-title>

            <v-data-table
              :headers="summaryHeaders"
              :items="bitzuimSummaryRows"
              :loading="isLoading"
              dense
              fixed-header
              height="79vh"
              mobile-breakpoint="0"
              hide-default-footer
              disable-pagination
              class="linked-table summary-table"
              loading-text="Loading... Please wait"
              @click:row="openDetails"
            >
              <template v-slot:no-data>
                <span>No customer rows</span>
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
        </v-col>

        <v-col cols="12" md="6">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading">
                <span>יזמות</span>
              </div>
              <v-spacer />
              ({{ yazamutSummaryRows.length }})
            </v-card-title>

            <v-data-table
              :headers="summaryHeaders"
              :items="yazamutSummaryRows"
              :loading="isLoading"
              dense
              fixed-header
              height="79vh"
              mobile-breakpoint="0"
              hide-default-footer
              disable-pagination
              class="linked-table summary-table"
              loading-text="Loading... Please wait"
              @click:row="openDetails"
            >
              <template v-slot:no-data>
                <span>No customer rows</span>
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
        </v-col>
      </v-row>

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

const YAZAMUT_COMPANY = 'יזמות';
const BITZUIM_COMPANY = 'ביצועים';
const SALARY_CODE_MIN = 3010;
const SALARY_CODE_MAX = 3050;

export default {
  name: 'LinkedListTable',
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
      showSalaryRows: false,
      dateInterval: { from: null, to: null },

      summaryHeaders: [
        { text: 'Code', value: 'code', class: 'linked-header', width: '90px' },
        { text: 'Description', value: 'description', class: 'linked-header', align: 'right' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'linked-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'linked-header' },
        { text: 'balance', value: 'balance', class: 'linked-header' },
      ],

    };
  },

  computed: {
    filteredBookRows() {
      return this.bookRows.filter(this.isBookInDateInterval);
    },

    yazamutSummaryRows() {
      return this.buildSummaryRows(TABLE_IDS.YAZAMUT_CUSTOMERS, YAZAMUT_COMPANY);
    },

    bitzuimSummaryRows() {
      return this.buildSummaryRows(TABLE_IDS.BITZUIM_CUSTOMERS, BITZUIM_COMPANY)
        .filter((row) => this.isSalaryCode(row.code) === this.showSalaryRows);
    },
  },

  mounted() {
    this.retrieveData();
  },

  methods: {
    isSalaryCode(code) {
      return code >= SALARY_CODE_MIN && code <= SALARY_CODE_MAX;
    },

    async retrieveData() {
      this.isLoading = true;

      try {
        const tableResponse = await apiService.clientGetEntities(TABLE_MODEL, {
          filter: JSON.stringify({
            table_id: { $in: [TABLE_IDS.YAZAMUT_CUSTOMERS, TABLE_IDS.BITZUIM_CUSTOMERS] },
          }),
        });

        this.tableRows = tableResponse.data;

        const customerCodes = [...new Set(this.tableRows.map((item) => Number(item.table_code)))];

        if (!customerCodes.length) {
          this.bookRows = [];
          return;
        }

        const bookResponse = await apiService.clientGetEntities(BOOKS_MODEL, {
          filter: JSON.stringify({ cust_id: { $in: customerCodes } }),
        });

        this.bookRows = bookResponse.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoading = false;
      }
    },

    buildSummaryRows(tableId, company) {
      return this.tableRows
        .filter((tableRow) => tableRow.table_id === tableId)
        .map((tableRow) => {
          const code = Number(tableRow.table_code);
          const matchingBooks = this.filteredBookRows.filter((bookRow) => {
            return Number(bookRow.cust_id) === code && bookRow.company === company;
          });

          const schumZchut = this.sumField(matchingBooks, 'schum_zchut');
          const schumHova = this.sumField(matchingBooks, 'schum_hova');

          return {
            code,
            description: tableRow.description,
            company,
            tableId,
            schum_zchut: schumZchut,
            schum_hova: schumHova,
            balance: schumHova - schumZchut,
          };
        })
        .sort((a, b) => a.code - b.code);
    },

    openDetails(summaryRow) {
      this.selectedSummaryRow = summaryRow;

      this.detailRows = this.filteredBookRows
        .filter((bookRow) => {
          return Number(bookRow.cust_id) === summaryRow.code && bookRow.company === summaryRow.company;
        })
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
  },
};
</script>

<style scoped>
.linked-list-page {
  direction: rtl;
  text-align: right;
}

.linked-content-row {
  direction: rtl;
}

.linked-interval-toolbar {
  display: flex;
  justify-content: center;
  padding: 0 12px 8px;
}

.linked-panel {
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
}

.linked-panel-title {
  min-height: 56px;
  padding: 12px 16px;
  gap: 8px;
  direction: rtl;
}

.salary-toggle {
  flex: 0 0 auto;
}

.linked-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.linked-heading span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.linked-heading small {
  color: #667085;
  font-size: 0.78rem;
  line-height: 1.2;
}

.linked-table {
  direction: rtl;
  text-align-last: right;
}

::v-deep .linked-header {
  background: #eef4ff !important;
  color: #1e3a5f !important;
  font-weight: 700 !important;
}

::v-deep .linked-table tbody tr {
  cursor: pointer;
}

::v-deep .linked-table tbody tr:hover {
  background: #f3f8ff !important;
}

.negative {
  background-color: lightcoral;
  color: white;
}

@media (max-width: 960px) {
  .linked-panel-title {
    align-items: flex-start;
  }
}
</style>
