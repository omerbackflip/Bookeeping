<template>
  <div class="linked-list-page">
    <v-container fluid>
      <v-row align="center" class="mb-3">
        <v-col cols="12" md="4">
          <h2 class="linked-list-title">Linked Books</h2>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-center">
          <v-btn-toggle v-model="selectedTableId" mandatory dense class="linked-list-toggle" @change="onTypeChange">
            <v-btn v-for="config in configOptions" :key="config.tableId" :value="config.tableId" small>
              {{ config.label }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense outlined/>
        </v-col>
      </v-row>

      <v-row class="linked-content-row">
        <v-col cols="12" sm="2">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading"> <span>כרטסות הנהח"ש</span> </div>
              <v-spacer />
              <v-chip small color="primary" text-color="white">{{ visibleLinkedRows.length }}</v-chip>
            </v-card-title>
            <v-data-table
              :headers="linkedHeaders"
              :items="visibleLinkedRows"
              :search="search"
              :loading="isLoadingRows"
              dense
              fixed-header
              height="62vh"
              mobile-breakpoint="0"
              hide-default-footer
              disable-pagination
              class="linked-table linked-rows-table"
              loading-text="Loading... Please wait"
              @click:row="selectLinkedRow"
            >
              <template v-slot:[`item.description`]="{ item }">
                <span :class="{ 'font-weight-medium': isSelectedLinkedRow(item) }">
                  {{ item.description }}
                </span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" sm="5">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading">
                <span v-if="selectedLinkedRow">{{ selectedLinkedRow.table_code }} - {{ summaryTitle }}</span>
              </div>
              <v-spacer />
              <v-chip small color="primary" text-color="white">{{ filteredData.length }}</v-chip>
              <export-excel
                v-if="filteredData.length"
                :data="$formatDataForExport(filteredData)"
                type="xlsx"
                :name="selectedConfig.exportName"
                :title="summaryTitle"
                footer="Exported from Book App"
              >
                <v-btn icon small color="primary">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>

              <v-btn-toggle v-model="company" dense group mandatory class="ml-3" @change="onCompanyChange">
                <v-btn value="ביצועים" text small>ביצועים</v-btn>
                <v-btn value="יזמות" text small>יזמות</v-btn>
              </v-btn-toggle>
            </v-card-title>

            <v-row class="summary-strip" no-gutters>
              <v-col cols="6" sm="4">
                <div class="summary-metric">
                  <span>זכות</span>
                  <strong>{{ formatNumber(summaryZchut) }}</strong>
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="summary-metric">
                  <span>חובה</span>
                  <strong>{{ formatNumber(summaryHova) }}</strong>
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="summary-metric" :class="{ negative: summaryDifference < 0 }">
                  <span>הפרש</span>
                  <strong>{{ formatNumber(summaryDifference) }}</strong>
                </div>
              </v-col>
            </v-row>

            <v-data-table
              :headers="bookHeaders"
              :items="filteredData"
              :loading="isLoadingSummary"
              dense
              fixed-header
              height="52vh"
              mobile-breakpoint="0"
              hide-default-footer
              disable-pagination
              class="linked-table book-table"
              loading-text="Loading... Please wait"
              @click:row="selectPratim"
            >
              <template v-slot:no-data>
                <span>{{ emptySummaryText }}</span>
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
                <span>{{ formatNumber(item.record_schum) }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" sm="5">
          <v-card outlined class="linked-panel">
            <v-card-title class="linked-panel-title">
              <div class="linked-heading">
                <span>{{ pratimHeader }}</span>
              </div>

              <v-spacer />
              <v-chip small color="primary" text-color="white">{{ pratimFilteredData.length }}</v-chip>

              <export-excel
                v-if="pratimFilteredData.length"
                :data="$formatDataForExport(pratimFilteredData)"
                type="xlsx"
                name="pratim-data"
                title="Pratim Data"
                footer="Exported from Book App"
              >
                <v-btn icon small color="primary">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>

              <v-btn v-if="selectedPratim" icon small @click="clearPratim">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-row class="summary-strip" no-gutters>
              <v-col cols="6" sm="4">
                <div class="summary-metric">
                  <span>זכות</span>
                  <strong>{{ formatNumber(pratimZchut) }}</strong>
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="summary-metric">
                  <span>חובה</span>
                  <strong>{{ formatNumber(pratimHova) }}</strong>
                </div>
              </v-col>
              <v-col cols="6" sm="4">
                <div class="summary-metric" :class="{ negative: pratimDifference < 0 }">
                  <span>הפרש</span>
                  <strong>{{ formatNumber(pratimDifference) }}</strong>
                </div>
              </v-col>
            </v-row>

            <v-data-table
              :headers="pratimHeaders"
              :items="pratimFilteredData"
              :loading="isLoadingPratim"
              dense
              fixed-header
              height="52vh"
              mobile-breakpoint="0"
              hide-default-footer
              disable-pagination
              class="linked-table book-table"
              loading-text="Loading... Please wait"
            >
              <template v-slot:no-data>
                <span>Select a book row</span>
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
                <span>{{ formatNumber(item.record_schum) }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import moment from 'moment';
import { BOOKS_MODEL, TABLE_MODEL } from '../constants/constants';
import { defaultLinkedListTableId, linkedListConfigs } from '../constants/linkedListConfigs';
import apiService from '../services/apiService';

export default {
  name: 'LinkedListTable',
  data() {
    return {
      selectedTableId: defaultLinkedListTableId,
      linkedRows: [],
      selectedLinkedRow: null,
      selectedPratim: null,
      search: '',
      company: 'ביצועים',
      summaryData: [],
      filteredData: [],
      pratimData: [],
      pratimFilteredData: [],
      summaryHova: 0,
      summaryZchut: 0,
      pratimHova: 0,
      pratimZchut: 0,
      pratimHeader: '',
      isLoadingRows: false,
      isLoadingSummary: false,
      isLoadingPratim: false,
      linkedHeaders: [
        { text: 'CODE', value: 'table_code', class: 'linked-header', width: '96px' },
        { text: 'Description', value: 'description', class: 'linked-header', align: 'right' },
      ],
      bookHeaders: [
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
    configOptions() {
      return Object.values(linkedListConfigs);
    },

    selectedConfig() {
      return linkedListConfigs[this.selectedTableId];
    },

    visibleLinkedRows() {
      return this.linkedRows.filter((item) => item.table_id === this.selectedTableId);
    },

    summaryTitle() {
      if (!this.selectedLinkedRow) {
        return this.selectedConfig.label;
      }

      return `${this.selectedLinkedRow.description}`;
    },

    emptySummaryText() {
      return this.selectedLinkedRow ? 'No matching book records' : 'Select a row';
    },

    summaryDifference() {
      return this.summaryZchut - this.summaryHova;
    },

    pratimDifference() {
      return this.pratimZchut - this.pratimHova;
    },

    pratimHeaders() {
      return this.bookHeaders.filter((header) => header.value !== 'pratim');
    },
  },

  mounted() {
    this.retrieveLinkedRows();
  },

  methods: {
    async retrieveLinkedRows() {
      this.isLoadingRows = true;

      try {
        const tableIds = Object.keys(linkedListConfigs).map(Number);
        const response = await apiService.clientGetEntities(TABLE_MODEL);

        this.linkedRows = response.data.filter((item) => tableIds.includes(item.table_id));
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoadingRows = false;
      }
    },

    onTypeChange(tableId) {
      this.selectedTableId = tableId;
      this.selectedLinkedRow = null;
      this.clearSummary();
      this.clearPratim();
    },

    async selectLinkedRow(row) {
      this.selectedLinkedRow = row;
      this.clearSummary();
      this.clearPratim();
      this.isLoadingSummary = true;

      try {
        const query = {
          [this.selectedConfig.queryField]: row.table_code,
        };
        const response = await apiService.clientGetEntities(BOOKS_MODEL, query);

        this.summaryData = response.data;
        this.filterCompany();
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoadingSummary = false;
      }
    },

    async selectPratim(item) {
      if (!item.pratim) return;

      this.selectedPratim = item;
      this.pratimHeader = item.pratim;
      this.pratimData = [];
      this.pratimFilteredData = [];
      this.isLoadingPratim = true;

      try {
        const response = await apiService.clientGetEntities(BOOKS_MODEL, { pratim: item.pratim });

        this.pratimData = response.data;
        this.filterPratimCompany();
      } catch (error) {
        console.log(error);
      } finally {
        this.isLoadingPratim = false;
      }
    },

    onCompanyChange(company) {
      this.company = company;
      this.filterCompany();

      if (this.selectedPratim) {
        this.filterPratimCompany();
      }
    },

    filterCompany() {
      this.filteredData = this.filterAndSortByCompany(this.summaryData);
      this.summaryHova = this.sumField(this.filteredData, 'schum_hova');
      this.summaryZchut = this.sumField(this.filteredData, 'schum_zchut');
    },

    filterPratimCompany() {
      this.pratimFilteredData = this.filterAndSortByCompany(this.pratimData);
      this.pratimHova = this.sumField(this.pratimFilteredData, 'schum_hova');
      this.pratimZchut = this.sumField(this.pratimFilteredData, 'schum_zchut');
    },

    filterAndSortByCompany(items) {
      return items
        .filter((item) => item.company === this.company)
        .slice()
        .sort((a, b) => new Date(b.asmchta_date) - new Date(a.asmchta_date));
    },

    sumField(items, field) {
      return items.reduce((total, item) => total + (Number(item[field]) || 0), 0);
    },

    clearSummary() {
      this.summaryData = [];
      this.filteredData = [];
      this.summaryHova = 0;
      this.summaryZchut = 0;
    },

    clearPratim() {
      this.selectedPratim = null;
      this.pratimHeader = '';
      this.pratimData = [];
      this.pratimFilteredData = [];
      this.pratimHova = 0;
      this.pratimZchut = 0;
    },

    isSelectedLinkedRow(item) {
      return this.selectedLinkedRow && this.selectedLinkedRow._id === item._id;
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

.linked-list-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
}

.linked-content-row {
  direction: rtl;
}

.linked-list-toggle {
  max-width: 100%;
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

.summary-strip {
  border-top: 1px solid #e7edf3;
  border-bottom: 1px solid #e7edf3;
  background: #f8fafc;
}

.summary-metric {
  padding: 10px 14px;
  border-right: 1px solid #e7edf3;
}

.summary-metric span {
  display: block;
  color: #667085;
  font-size: 0.75rem;
}

.summary-metric strong {
  display: block;
  color: #1f2937;
  font-size: 1rem;
  line-height: 1.35;
}

.summary-metric.negative strong {
  color: #c62828;
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

::v-deep .linked-rows-table table {
  table-layout: fixed;
}

::v-deep .linked-rows-table td,
::v-deep .linked-rows-table th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

::v-deep .book-table table {
  min-width: 760px;
}

@media (max-width: 960px) {
  .linked-panel-title {
    align-items: flex-start;
  }

  .summary-metric {
    border-bottom: 1px solid #e7edf3;
  }
}
</style>
