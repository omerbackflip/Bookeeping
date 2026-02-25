<template>
  <v-dialog v-model="internalOpen" max-width="1100px">
    <v-card>
      <v-flex>
        <v-data-table
          :headers="headers"
          :items="items"
          disable-pagination
          hide-default-footer
          fixed-header
          :item-class="itemClass"
          mobile-breakpoint="0"
          @click:row="rowClicked"
          class="elevation-3 list"
          dense
          height="70vh">
          <template v-slot:top>
            <v-toolbar>
              <v-toolbar-title class="text-center" style="width:100%;">
                <div>
                  <span>{{ title }} - {{ total.toLocaleString() }}<span v-if="!hideLeft"> (Left: {{ left.toLocaleString() }})</span></span>
                  <span v-if="budget">{{ ' ------------ תקציב - '  + budget.toLocaleString()}}</span>
                </div>
              </v-toolbar-title>
              <v-spacer />
              <!-- export button separated so header still renders even if export fails -->
              <export-excel
                :data="exportData"
                type="xlsx"
                :name="title.toLocaleString()"
                class="mt-3">
                <v-btn small class="btn btn-danger"> <v-icon>mdi-download</v-icon> </v-btn>
              </export-excel>
              <v-spacer />
            </v-toolbar>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <span>{{ item.total ? item.total.toLocaleString() : "" }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <span> {{ item.date | formatDate }}</span>
          </template>
          <template v-slot:[`item.published`]="{ item }">
            <td @click.stop>
              <v-checkbox v-model="item.published" @click="togglePublished(item)"></v-checkbox>
            </td>
          </template>
          <template v-slot:[`item.invoiceId`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on" :class="item.GDFileId ? 'summary' : ''" @click.stop="item.GDFileId ? clickToView(item.GDFileId) : null">{{ item.invoiceId }}</span>
              </template>
              <span>{{item.GDFileName}}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-flex>
    </v-card>
  </v-dialog>
</template>

<script>
import modalDialog from '../Common/InvoiceModal.vue';
import exportExcel from 'vue-excel-export';

export default {
  name: 'InvoiceSummaryDialog',
  components: { modalDialog, exportExcel },
  props: {
    open: Boolean,
    items: Array,
    headers: Array,
    title: String,
    total: Number,
    left: Number,
    budget: Number,
    exportData: Array,
    itemClass: String,
    hideLeft: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalOpen: this.open
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
    rowClicked(item) {
      this.$emit('row-clicked', item);
    },
    togglePublished(item) {
      // forward event for parent to handle logic if desired
      this.$emit('toggle-published', item);
    },
    clickToView(GDFileId) {
      // propagate if parent wants to open file
      this.$emit('view-file', GDFileId);
    }
  }
};
</script>

<style scoped>
/* minimal; styles from parent still apply */
</style>
