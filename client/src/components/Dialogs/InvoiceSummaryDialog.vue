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
              <export-excel
                :data="exportData"
                type="xlsx"
                :name="title.toLocaleString()"
                class="mt-1 ml-5">
                <v-btn small class="btn btn-danger"> <v-icon small>mdi-download</v-icon> </v-btn>
              </export-excel>



              <v-toolbar-title class="text-center" style="width:100%;">
                <div>
                  <span>{{ title }} - {{ total.toLocaleString() }}<span v-if="!hideLeft"> (Left: {{ left.toLocaleString() }})</span></span>
                  <span v-if="budget">{{ ' ------------ תקציב - '  + budget.toLocaleString()}}</span>
                </div>
              </v-toolbar-title>


              <v-spacer />
              <v-btn small @click="closeDialog" class="btn btn-danger mr-3">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
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

export default {
  name: 'InvoiceSummaryDialog',
  components: { modalDialog },
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
    },
    isNestedDialog: {
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
      if (!val) {
        this.$emit(this.isNestedDialog ? 'back' : 'close');
      }
    }
  },
  methods: {
    closeDialog() {
      this.$emit(this.isNestedDialog ? 'back' : 'close');
      this.internalOpen = false;
    },
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
