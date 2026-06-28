<template>
  <div class="linked-list-page">
    <v-container fluid>

      <v-row class="linked-content-row">
        <v-col cols="12" md="6">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading">
                <span>ביצועים</span>
              </div>
              <v-spacer />
              ({{ bitzuimSummaryRows.length }})
            </v-card-title>

            <v-data-table
              :headers="summaryHeaders"
              :items="bitzuimSummaryRows"
              :loading="isLoading"
              dense
              fixed-header
              height="68vh"
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
              height="68vh"
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

      <v-dialog v-model="detailDialog" max-width="1200px">
        <v-card outlined class="linked-panel">
          <v-card-title class="linked-panel-title">
            <div class="linked-heading">
              <span v-if="selectedSummaryRow">{{ selectedSummaryRow.company }} - {{ detailTitle }}</span>
            </div>
            <v-text-field
              v-if="selectedSummaryRow"
              v-model="search"
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
              זכות: {{ formatNumber(selectedSummaryRow.schum_zchut) }}
            </v-chip>

            <v-chip
              v-if="selectedSummaryRow"
              small
              color="primary"
              text-color="white"
            >
              חובה: {{ formatNumber(selectedSummaryRow.schum_hova) }}
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
              :name="`${selectedSummaryRow.company} - ${detailTitle}`"
              :title="`${selectedSummaryRow.company} - ${detailTitle}`"
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
            :search="search"
            dense
            fixed-header
            height="70vh"
            mobile-breakpoint="0"
            hide-default-footer
            disable-pagination
            class="linked-table book-table"
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

const YAZAMUT_TABLE_ID = 20;
const BITZUIM_TABLE_ID = 21;

const YAZAMUT_COMPANY = 'יזמות';
const BITZUIM_COMPANY = 'ביצועים';

export default {
  name: 'LinkedListTable',
  data() {
    return {
      tableRows: [],
      bookRows: [],
      selectedSummaryRow: null,
      detailRows: [],
      detailDialog: false,
      detailTitle: '',
      isLoading: false,
      search: '',

      summaryHeaders: [
        { text: 'Code', value: 'code', class: 'linked-header', width: '90px' },
        { text: 'Description', value: 'description', class: 'linked-header', align: 'right' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'linked-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'linked-header' },
        { text: 'balance', value: 'balance', class: 'linked-header' },
      ],

      detailHeaders: [
        { text: 'year', value: 'year', class: 'linked-header' },
        { text: 'asmchta_date', value: 'asmchta_date', class: 'linked-header' },
        { text: 'asmacta1', value: 'asmacta1', class: 'linked-header' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'linked-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'linked-header' },
        { text: 'pratim', value: 'pratim', class: 'linked-header', align: 'right' },
        { text: 'record_schum', value: 'record_schum', class: 'linked-header' },
      ],
    };
  },

  computed: {
    yazamutSummaryRows() {
      return this.buildSummaryRows(YAZAMUT_TABLE_ID, YAZAMUT_COMPANY);
    },

    bitzuimSummaryRows() {
      return this.buildSummaryRows(BITZUIM_TABLE_ID, BITZUIM_COMPANY);
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
          filter: JSON.stringify({
            table_id: { $in: [YAZAMUT_TABLE_ID, BITZUIM_TABLE_ID] },
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
          const matchingBooks = this.bookRows.filter((bookRow) => {
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
      this.detailTitle = `${summaryRow.description} - ${summaryRow.code}`;

      this.detailRows = this.bookRows
        .filter((bookRow) => {
          return Number(bookRow.cust_id) === summaryRow.code && bookRow.company === summaryRow.company;
        })
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
.linked-list-page {
  direction: rtl;
  text-align: right;
}

.linked-content-row {
  direction: rtl;
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

.book-table {
  border-top: 0;
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

::v-deep .book-table table {
  min-width: 760px;
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
