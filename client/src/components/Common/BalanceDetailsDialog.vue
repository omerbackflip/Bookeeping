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
        <v-chip v-if="selectedRow" small color="primary" text-color="white">
          schum_zchut: {{ formatNumber(selectedRow.schum_zchut) }}
        </v-chip>
        <v-chip v-if="selectedRow" small color="primary" text-color="white">
          schum_hova: {{ formatNumber(selectedRow.schum_hova) }}
        </v-chip>
        <v-chip
          v-if="selectedRow"
          small
          :color="selectedRow.balance < 0 ? 'error' : 'primary'"
          text-color="white"
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

      <v-data-table
        :headers="headers"
        :items="rows"
        :search="search"
        dense
        fixed-header
        height="80vh"
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

export default {
  name: 'BalanceDetailsDialog',
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
      }
    },
  },
  methods: {
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
  height: 100%;
}

.balance-details-title {
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
  direction: rtl;
  text-align-last: right;
  border-top: 0;
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
  .balance-details-title {
    align-items: flex-start;
  }
}
</style>
