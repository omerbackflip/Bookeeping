<template>
  <v-dialog :value="value" max-width="1200px" @input="$emit('input', $event)">
    <v-card outlined class="balance-details-panel">
      <v-card-title class="balance-details-title">
        <div class="balance-details-heading">
          <span v-if="selectedRow">{{ title }}</span>
        </div>
        <v-text-field
          v-if="selectedRow"
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
          v-if="selectedRow"
          small
          color="primary"
          :outlined="chartMetric !== 'schum_zchut'"
          :text-color="chartMetric === 'schum_zchut' ? 'white' : 'primary'"
          :aria-pressed="String(chartMetric === 'schum_zchut')"
          title="Show yearly זכות totals"
          @click="chartMetric = 'schum_zchut'"
        >
          schum_zchut: {{ formatNumber(selectedRow.schum_zchut) }}
        </v-chip>
        <v-chip
          v-if="selectedRow"
          small
          color="primary"
          :outlined="chartMetric !== 'schum_hova'"
          :text-color="chartMetric === 'schum_hova' ? 'white' : 'primary'"
          :aria-pressed="String(chartMetric === 'schum_hova')"
          title="Show yearly חובה totals"
          @click="chartMetric = 'schum_hova'"
        >
          schum_hova: {{ formatNumber(selectedRow.schum_hova) }}
        </v-chip>
        <v-chip
          v-if="selectedRow"
          small
          :color="selectedRow.balance < 0 ? 'error' : 'primary'"
          :outlined="chartMetric !== 'balance'"
          :text-color="chartMetric === 'balance' ? 'white' : (selectedRow.balance < 0 ? 'error' : 'primary')"
          :aria-pressed="String(chartMetric === 'balance')"
          title="Show accumulated balance"
          @click="chartMetric = 'balance'"
        >
          Balance: {{ formatNumber(selectedRow.balance) }}
        </v-chip>
        <v-spacer />
        ({{ rows.length }})
        <export-excel
          v-if="rows.length"
          :data="$formatDataForExport(rows)"
          type="xlsx"
          :name="title"
          :title="title"
          footer="Exported from Book App"
        >
          <v-btn icon small color="primary">
            <v-icon small>mdi-download</v-icon>
          </v-btn>
        </export-excel>
        <v-btn icon small @click="$emit('input', false)">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <section class="year-comparison" aria-label="Year comparison">
        <div v-if="selectedYear !== null" class="year-comparison-toolbar">
          <v-chip v-if="selectedYear !== null" small close color="primary" outlined @click:close="selectedYear = null">
            Table year: {{ selectedYear }}
          </v-chip>
          <span v-if="selectedYear !== null" class="year-comparison-note">{{ tableRows.length }} records</span>
        </div>
        <div>
          <div class="year-chart">
            <apexchart
              v-if="value && yearlyTotals.length"
              type="bar"
              height="240"
              :options="chartOptions"
              :series="chartSeries"
              @dataPointSelection="selectChartYear"
            />
            <div v-else class="year-chart-empty">No yearly data available</div>
          </div>
        </div>
      </section>

      <v-data-table
        :headers="headers"
        :items="tableRows"
        :search="search"
        dense
        fixed-header
        height="100%"
        mobile-breakpoint="0"
        hide-default-footer
        disable-pagination
        class="balance-details-table"
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
</template>

<script>
import moment from 'moment';
import VueApexCharts from 'vue-apexcharts';

export default {
  name: 'BalanceDetailsDialog',
  components: { apexchart: VueApexCharts },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    selectedRow: {
      type: Object,
      default: null,
    },
    rows: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      search: '',
      chartMetric: 'balance',
      selectedYear: null,
      chartMetrics: [
        { text: 'Accumulated balance', value: 'balance' },
        { text: 'זכות — yearly total', value: 'schum_zchut' },
        { text: 'חובה — yearly total', value: 'schum_hova' },
      ],
      headers: [
        { text: 'company', value: 'company', class: 'balance-details-header' },
        { text: 'year', value: 'year', class: 'balance-details-header' },
        { text: 'asmchta_date', value: 'asmchta_date', class: 'balance-details-header' },
        { text: 'asmacta1', value: 'asmacta1', class: 'balance-details-header' },
        { text: 'schum_zchut', value: 'schum_zchut', class: 'balance-details-header' },
        { text: 'schum_hova', value: 'schum_hova', class: 'balance-details-header' },
        { text: 'pratim', value: 'pratim', class: 'balance-details-header', align: 'right' },
        { text: 'record_schum', value: 'record_schum', class: 'balance-details-header' },
      ],
    };
  },
  computed: {
    yearlyTotals() {
      const totals = new Map();
      this.rows.forEach((row) => {
        const year = this.getRowYear(row);
        if (year === null) return;
        if (!totals.has(year)) totals.set(year, { year, schum_hova: 0, schum_zchut: 0 });
        const total = totals.get(year);
        total.schum_hova += this.numericAmount(row.schum_hova);
        total.schum_zchut += this.numericAmount(row.schum_zchut);
      });
      let balance = 0;
      return [...totals.values()].sort((a, b) => a.year - b.year).map((total) => {
        balance += total.schum_hova - total.schum_zchut;
        return { ...total, balance };
      });
    },
    unassignedYearCount() {
      return this.rows.filter((row) => this.getRowYear(row) === null).length;
    },
    tableRows() {
      return this.selectedYear === null ? this.rows : this.rows.filter((row) => this.getRowYear(row) === this.selectedYear);
    },
    chartSeries() {
      return [{
        name: this.chartMetrics.find((metric) => metric.value === this.chartMetric).text,
        data: this.yearlyTotals.map((total) => total[this.chartMetric]),
      }];
    },
    chartOptions() {
      return {
        chart: { toolbar: { show: false }, animations: { enabled: false } },
        colors: [this.chartMetric === 'schum_zchut' ? '#00897b' : '#1976d2'],
        plotOptions: { bar: { columnWidth: '50%', colors: { ranges: [{ from: -Number.MAX_VALUE, to: -0.000001, color: '#d32f2f' }] } } },
        dataLabels: { enabled: false },
        xaxis: { categories: this.yearlyTotals.map((total) => String(total.year)), title: { text: 'Year' } },
        yaxis: { labels: { formatter: (amount) => this.formatNumber(amount) } },
        annotations: { yaxis: [{ y: 0, borderColor: '#667085', strokeDashArray: 0 }] },
        grid: { borderColor: '#e5e7eb' },
        tooltip: {
          y: {
            formatter: (amount, { dataPointIndex }) => {
              const previous = this.yearlyTotals[dataPointIndex - 1];
              if (!previous) return `${this.formatNumber(amount)} · First included year`;
              const prior = previous[this.chartMetric];
              const difference = amount - prior;
              const change = `${difference > 0 ? '+' : ''}${this.formatNumber(difference)}`;
              const percent = prior === 0 ? '' : ` (${(difference / Math.abs(prior) * 100).toFixed(1)}%)`;
              return `${this.formatNumber(amount)} · Change since ${previous.year}: ${change}${percent}`;
            },
          },
        },
        noData: { text: 'No yearly data available' },
      };
    },
    title() {
      if (!this.selectedRow) {
        return '';
      }
      return `${this.selectedRow.company || ''} - ${this.selectedRow.description || ''} - ${this.selectedRow.code || ''}`;
    },
  },
  watch: {
    value(isOpen) {
      if (isOpen) {
        this.search = '';
        this.selectedYear = null;
      }
    },
  },
  methods: {
    numericAmount(value) {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    },
    getRowYear(row) {
      const year = Number(row.year);
      return Number.isInteger(year) && year > 0 ? year : null;
    },
    selectChartYear(event, chartContext, { dataPointIndex }) {
      const total = this.yearlyTotals[dataPointIndex];
      if (total) this.selectedYear = this.selectedYear === total.year ? null : total.year;
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
.balance-details-panel {
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 88vh;
  display: flex;
  flex-direction: column;
}

.balance-details-title {
  flex: 0 0 auto;
  min-height: 56px;
  padding: 12px 16px;
  gap: 8px;
  direction: rtl;
}

.balance-details-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.balance-details-heading span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.balance-details-table {
  flex: 1 1 auto;
  min-height: 120px;
  overflow: hidden;
  direction: rtl;
  text-align-last: right;
  border-top: 0;
}

.year-comparison {
  flex: 0 0 auto;
  padding: 8px 16px 0;
  border-top: 1px solid #e5e7eb;
}

.year-comparison-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  direction: rtl;
}

.year-comparison-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #667085;
}

.year-chart {
  direction: ltr;
}

.year-chart-empty {
  padding: 24px;
  text-align: center;
}

::v-deep .year-chart .apexcharts-bar-area {
  cursor: pointer;
}

::v-deep .balance-details-table .v-data-table__wrapper {
  height: 100%;
}

::v-deep .balance-details-header {
  background: #eef4ff !important;
  color: #1e3a5f !important;
  font-weight: 700 !important;
}

::v-deep .balance-details-table tbody tr {
  cursor: pointer;
}

::v-deep .balance-details-table tbody tr:hover {
  background: #f3f8ff !important;
}

::v-deep .balance-details-table table {
  min-width: 860px;
}

.negative {
  background-color: lightcoral;
  color: white;
}

@media (max-width: 960px) {
  .balance-details-panel {
    overflow-y: auto;
  }

  .balance-details-table {
    flex-shrink: 0;
    height: 35vh !important;
  }

  .balance-details-title {
    align-items: flex-start;
  }
}
</style>
