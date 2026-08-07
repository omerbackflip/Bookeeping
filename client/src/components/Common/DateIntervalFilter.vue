<template>
  <div class="date-interval-filter">
    <v-btn
      small
      outlined
      :color="mode === 'all' ? 'primary' : undefined"
      @click="selectAll"
    >
      All
    </v-btn>

    <div class="interval-group">
      <span class="interval-label">Monthly</span>
      <div class="interval-buttons">
        <v-btn small icon outlined aria-label="Previous month" @click="moveMonth(-1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          small
          outlined
          class="interval-value month-value"
          :color="mode === 'month' ? 'primary' : undefined"
          @click="selectMonth"
        >
          {{ monthLabel }}
        </v-btn>
        <v-btn small icon outlined aria-label="Next month" @click="moveMonth(1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="interval-group">
      <span class="interval-label">Yearly</span>
      <div class="interval-buttons">
        <v-btn small icon outlined aria-label="Previous year" @click="moveYear(-1)">
          <v-icon small>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
          small
          outlined
          class="interval-value"
          :color="mode === 'year' ? 'primary' : undefined"
          @click="selectYear"
        >
          {{ selectedYear }}
        </v-btn>
        <v-btn small icon outlined aria-label="Next year" @click="moveYear(1)">
          <v-icon small>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <v-menu v-model="customMenu" :close-on-content-click="false" offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          small
          outlined
          :color="mode === 'custom' ? 'primary' : undefined"
          v-bind="attrs"
          v-on="on"
        >
          {{ customLabel }}
        </v-btn>
      </template>
      <v-card>
        <v-date-picker v-model="customDates" range no-title></v-date-picker>
        <v-card-actions>
          <v-btn text small @click="customMenu = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            text
            small
            color="primary"
            :disabled="customDates.length !== 2"
            @click="applyCustomRange"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DateIntervalFilter',
  data() {
    return {
      mode: 'all',
      selectedMonth: moment().startOf('month'),
      selectedYear: moment().year(),
      customMenu: false,
      customDates: [],
      appliedCustomDates: [],
    };
  },
  computed: {
    monthLabel() {
      return this.selectedMonth.format('MMM YYYY').toUpperCase();
    },
    customLabel() {
      if (this.mode !== 'custom' || this.appliedCustomDates.length !== 2) {
        return 'From-To';
      }
      return this.appliedCustomDates
        .map((date) => moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'))
        .join(' - ');
    },
  },
  methods: {
    selectAll() {
      this.mode = 'all';
      this.emitInterval(null, null);
    },
    selectMonth() {
      this.mode = 'month';
      this.emitInterval(
        this.selectedMonth.clone().startOf('month'),
        this.selectedMonth.clone().endOf('month'),
      );
    },
    moveMonth(amount) {
      this.selectedMonth = this.selectedMonth.clone().add(amount, 'month');
      this.selectMonth();
    },
    selectYear() {
      this.mode = 'year';
      this.emitInterval(
        moment({ year: this.selectedYear }).startOf('year'),
        moment({ year: this.selectedYear }).endOf('year'),
      );
    },
    moveYear(amount) {
      this.selectedYear += amount;
      this.selectYear();
    },
    applyCustomRange() {
      const dates = this.customDates.slice().sort();
      this.customDates = dates;
      this.appliedCustomDates = dates;
      this.mode = 'custom';
      this.customMenu = false;
      this.emitInterval(
        moment(dates[0], 'YYYY-MM-DD').startOf('day'),
        moment(dates[1], 'YYYY-MM-DD').endOf('day'),
      );
    },
    emitInterval(from, to) {
      this.$emit('change', {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      });
    },
  },
};
</script>

<style scoped>
.date-interval-filter {
  direction: ltr;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.interval-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.interval-label {
  color: #667085;
  font-size: 0.7rem;
  line-height: 1;
}

.interval-buttons {
  display: flex;
  gap: 2px;
}

.interval-value {
  min-width: 64px !important;
}

.month-value {
  min-width: 98px !important;
}
</style>
