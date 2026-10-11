<template>
  <section class="marketing-analysis" aria-label="ניתוח הוצאות שיווק">
    <div class="expense-controls">
      <v-select :value="categories" :items="categoryOptions" multiple chips small-chips dense outlined hide-details label="ערוצי הוצאות" @change="changeCategories" />
      <v-btn small text @click="changeCategories(categoryOptions.map(item => item.value))">כל הקטגוריות</v-btn>
    </div>
    <div class="expense-totals">
      <v-chip small outlined>סה״כ הוצאות בכרטיס: {{ format(total(rows)) }}</v-chip>
      <v-chip small color="primary" outlined>סה״כ הוצאות בבחירה: {{ format(total(visibleRows)) }}</v-chip>
      <v-chip v-if="selection" small close @click:close="$emit('select', null)">{{ selection.month }} · {{ categoryLabel(selection.category) }}</v-chip>
    </div>
    <div class="category-totals">
      <span v-for="category in categories" :key="category">{{ categoryLabel(category) }}: {{ format(total(visibleRows.filter(row => classify(row) === category))) }}</span>
    </div>
    <div class="expense-chart">
      <apexchart v-if="active && monthly.series.length && monthly.months.length" type="bar" height="240" :options="options" :series="monthly.series" @dataPointSelection="selectBar" />
      <div v-else class="empty">אין נתונים להשוואה בבחירה הנוכחית</div>
    </div>
    <small>{{ visibleRows.length }} רשומות בבחירה · {{ excludedCount }} רשומות בערוצים שלא נבחרו. אחר / לא מסווג כולל תיאורים שלא ניתן לשייך בוודאות.</small>
    <small v-if="undatedCount">{{ undatedCount }} רשומות ללא תאריך תקין אינן מופיעות בגרף.</small>
  </section>
</template>

<script>
import VueApexCharts from 'vue-apexcharts';
import { EXPENSE_CATEGORIES, classifyExpense, expenseAmount, expenseMonth, monthlyExpenses } from '../../utils/marketingExpenses';

export default {
  name: 'MarketingExpenseAnalysis',
  components: { apexchart: VueApexCharts },
  props: {
    active: Boolean,
    rows: { type: Array, default: () => [] },
    chartRows: { type: Array, default: () => [] },
    visibleRows: { type: Array, default: () => [] },
    categories: { type: Array, default: () => ['facebook', 'google'] },
    selection: { type: Object, default: null },
  },
  computed: {
    categoryOptions() { return EXPENSE_CATEGORIES.map(({ value, text }) => ({ value, text })); },
    monthly() { return monthlyExpenses(this.chartRows, this.categories); },
    excludedCount() { return this.rows.filter(row => !this.categories.includes(classifyExpense(row))).length; },
    undatedCount() { return this.chartRows.filter(row => !expenseMonth(row)).length; },
    options() {
      return {
        chart: { toolbar: { show: true }, animations: { enabled: false } },
        legend: { show: false },
        plotOptions: { bar: { columnWidth: '65%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: this.monthly.months, tickAmount: Math.min(12, this.monthly.months.length), labels: { rotate: -45 }, title: { text: 'חודש / שנה' } },
        yaxis: { title: { text: 'סה״כ הוצאות' }, labels: { formatter: this.format } },
        tooltip: { shared: true, intersect: false, y: { formatter: this.format } },
        noData: { text: 'אין נתונים' },
      };
    },
  },
  methods: {
    classify: classifyExpense,
    total(rows) { return rows.reduce((sum, row) => sum + expenseAmount(row), 0); },
    format(amount) { return Number(amount).toLocaleString('he-IL', { maximumFractionDigits: 2 }); },
    categoryLabel(value) { return EXPENSE_CATEGORIES.find(category => category.value === value).text; },
    changeCategories(value) { this.$emit('categories-change', value); this.$emit('select', null); },
    selectBar(event, context, { seriesIndex, dataPointIndex }) {
      const category = this.categories[seriesIndex];
      const month = this.monthly.months[dataPointIndex];
      if (!category || !month) return;
      this.$emit('select', this.selection && this.selection.category === category && this.selection.month === month ? null : { category, month });
    },
  },
};
</script>

<style scoped>
.marketing-analysis { flex: 0 0 auto; direction: rtl; padding: 12px 16px; border-top: 1px solid #e5e7eb; }
.expense-controls { display: flex; align-items: center; gap: 8px; }
.expense-controls .v-select { min-width: 0; }
.expense-totals, .category-totals { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 8px; }
.category-totals, small { font-size: 12px; color: #475467; }
small { display: block; }
.expense-chart { direction: ltr; }
.empty { padding: 24px; text-align: center; }
::v-deep .apexcharts-bar-area { cursor: pointer; }
</style>
