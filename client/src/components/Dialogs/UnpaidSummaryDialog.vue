<template>
  <v-dialog v-model="internalOpen" max-width="600px">
    <v-card>
      <v-card-title>
        Unpaid totals by supplier (Total: {{ pending.toLocaleString() }})
        <v-spacer />
        <v-btn icon small @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="items"
          disable-pagination
          hide-default-footer
          class="elevation-2"
          @click:row="rowClicked"
          dense>
          <template v-slot:[`item.total`]="{ item }">
            <span>{{ item.total ? item.total.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.count`]="{ item }">
            <span>{{ item.count }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'UnpaidSummaryDialog',
  props: {
    open: Boolean,
    items: Array,
    pending: Number
  },
  data() {
    return {
      internalOpen: this.open,
      headers: [
        { text: 'Supplier', value: 'supplier', align: 'right', class: 'hdr-styles' },
        { text: 'Total', value: 'total', align: 'right', class: 'hdr-styles' },
        { text: 'Invoices', value: 'count', align: 'right', class: 'hdr-styles' }
      ]
    };
  },
  watch: {
    open(val) {
      this.internalOpen = val;
    },
    internalOpen(val) {
      if (!val) this.$emit('close');
    }
  },
  methods: {
    closeDialog() {
      this.internalOpen = false;
    },
    rowClicked(item) {
      this.$emit('supplier-selected', item);
    }
  }
};
</script>

<style scoped>
/* reuse any needed styles, or none */
</style>
