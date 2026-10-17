<template>
  <div class="list row hebrew">
    <v-layout>
      <v-flex>
        <section v-if="mobileView" class="mobile-summary elevation-3" aria-label="סיכום מכירות">
          <h2>מכירות · {{ holdersCount }}/{{ holdersList.length }}</h2>
          <div class="mobile-figures">
            <div><span>סה״כ חוזים</span><strong>{{ formatTotal(totalSales) }}</strong></div>
            <div><span>שולם עד כה</span><strong>{{ formatTotal(totalPayed) }}</strong></div>
            <div><span>נותר לתשלום</span><strong>{{ formatTotal(totalRemaining) }}</strong></div>
            <div><span>הפרשי מע״מ</span><strong>{{ formatTotal(totalVatGap) }}</strong></div>
            <div><span>שינויי דיירים</span><strong>{{ formatTotal(totalBuyerChanges) }}</strong></div>
          </div>
        </section>
        <section class="sale-price-chart elevation-3" aria-label="Sold flat contract prices">
            <v-toolbar v-if="!mobileView" flat>
              <v-toolbar-title> מכירות - {{holdersCount}}/{{holdersList.length}} </v-toolbar-title>
              <v-spacer></v-spacer>
              סה"כ - {{ formatTotal(totalSales) }}
              <v-spacer></v-spacer>
              שולם עד כה - {{ totalPayed.toLocaleString('en-US', {maximumFractionDigits: 0}) }} ({{ getPercentage(totalPayed, totalSales) }}%)
              <v-spacer></v-spacer>
              נותר לתשלום - {{ totalRemaining.toLocaleString('en-US', {maximumFractionDigits: 0}) }} ({{ getPercentage(totalRemaining, totalSales) }}%)
              <v-spacer></v-spacer>
              הפרשי מע"מ - {{ totalVatGap.toLocaleString('en-US', {maximumFractionDigits: 0}) }}
              <v-spacer></v-spacer>
              שינויי דיירים - {{ totalBuyerChanges.toLocaleString('en-US', {maximumFractionDigits: 0}) }}
              <v-spacer></v-spacer>
              <export-excel
                :data="$formatDataForExport(holdersExportData)"
                type="xlsx"
                name="holders"
                title="Holders">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
            </v-toolbar>
          <!-- <h3 v-if="mobileView">מחירי דירות שנמכרו <small>· באלפים</small></h3> -->
          <!-- <p v-if="mobileView" class="chart-hint">גללו לצדדים ולחצו על עמודה לפרטים</p> -->
          <div class="chart-scroll" :tabindex="mobileView ? 0 : null" aria-label="גרף מחירי דירות">
            <div :style="mobileView ? { minWidth: Math.max(360, soldFlats.length * 64) + 'px' } : {}">
              <apexchart
                v-if="soldFlats.length"
                type="bar"
                height="280"
                :options="salePriceChartOptions"
                :series="salePriceChartSeries"
                @dataPointSelection="selectSaleFlat"
              />
              <div v-else>{{ isLoading ? 'Loading sold flats…' : 'No sold flats available' }}</div>
            </div>
          </div>
          <div v-if="mobileView && selectedSaleFlat" class="selected-flat" aria-live="polite">
            <strong>דירה {{ selectedSaleFlat.flatId }} · {{ selectedSaleFlat.holderName }}</strong>
            <div>מחיר חוזה: {{ formatOptionalNumber(selectedSaleFlat.signPrice) }}</div>
            <div>שולם: {{ formatOptionalNumber(selectedSaleFlat.paid) }} · נותר: {{ formatOptionalNumber(selectedSaleFlat.remainingBalance) }}</div>
          </div>
        </section>
        <section v-if="mobileView" class="mobile-buyers" aria-label="רוכשים">
          <v-progress-linear v-if="isLoading" indeterminate aria-label="טוען רוכשים" />
          <p v-else-if="!filteredMobileHolders.length">לא נמצאו דירות</p>
          <article v-if="filteredMobileHolders.length" v-for="holder in filteredMobileHolders" :key="holder.flatId" class="buyer-card elevation-2">
            <div class="buyer-heading">
              <h3>דירה {{ String(holder.flatId).padStart(2, '0') }} · {{ holder.holderName || 'טרם נמכרה' }}</h3>
              <v-spacer />
              <v-btn small outlined @click="getHolderForEdit(holder)">עריכה</v-btn>
            </div>
            <div class="mobile-figures buyer-figures">
              <div><span>מחיר חוזה</span><strong>{{ formatOptionalNumber(holder.signPrice) || '—' }}</strong></div>
              <div><span>שולם</span><strong>{{ formatOptionalNumber(holder.paid) || '—' }}</strong></div>
              <div><span>נותר</span><strong>{{ formatOptionalNumber(holder.remainingBalance) || '—' }}</strong></div>
            </div>
            <details>
              <summary>פרטי הרוכש ותנועות</summary>
              <dl class="buyer-details">
                <dt>תאריך חתימה</dt><dd>{{ holder.signDate | formatDate }}</dd>
                <dt>טלפון</dt><dd>{{ holder.phone }}</dd>
                <dt>דוא״ל</dt><dd>{{ holder.email || '—' }}</dd>
                <dt>שולם עד 2024</dt><dd>{{ formatOptionalNumber(holder.paidThrough2024) || '—' }}</dd>
                <dt>שולם מ-2025</dt><dd>{{ formatOptionalNumber(holder.paidFrom2025) || '—' }}</dd>
                <dt>הפרשי מע״מ</dt><dd>{{ formatOptionalNumber(holder.vatGap) || '—' }}</dd>
                <dt>שינויי דיירים</dt><dd>{{ formatOptionalNumber(holder.buyerChanges) || '—' }}</dd>
                <dt>הערות</dt><dd>{{ holder.remark || '—' }}</dd>
              </dl>
              <h4>תנועות בכרטיס ({{ holder.bookEntries.length }})</h4>
              <p v-if="!holder.bookEntries.length">אין תנועות להצגה</p>
              <details v-for="(entry, index) in holder.bookEntries" :key="entry._id || index" class="payment-card">
                <summary>
                  <span>{{ entry.asmchta_date | formatDate }}</span>
                  <span>{{ entry.pratim || 'ללא תיאור' }}</span>
                  <span>חובה: {{ formatNumber(entry.schum_hova) }} · זכות: {{ formatNumber(entry.schum_zchut) }}</span>
                </summary>
                <div>קטגוריה: {{ entry.paymentCategory || '—' }}</div>
                <div>אסמכתא: {{ entry.asmacta1 || '—' }}</div>
              </details>
            </details>
          </article>
        </section>
        <v-data-table
          v-else
          :headers="getHeaders()"
          :items="holdersList"
          :search="search"
          @click:row="getHolderForEdit"
          disable-pagination
          hide-default-footer
          fixed-header
          mobile-breakpoint="0"
          height="80vh"
          class="elevation-3 mt-0"
          :loading="isLoading"
          loader-height="20"
          dense
          single-expand
          show-expand
          :expanded.sync="expanded"
          item-key="flatId"
          :sort-by="['flatId']">
          <template v-slot:top>
            <!-- <v-toolbar flat>
              <v-toolbar-title> Sales - {{holdersCount}}/{{holdersList.length}} </v-toolbar-title>
              <v-spacer></v-spacer>
              Remaining - {{ totalRemaining.toLocaleString('en-US', {maximumFractionDigits: 0}) }} ({{ getPercentage(totalRemaining, totalSales) }}%)
              <v-spacer></v-spacer>
              VAT Gap - {{ totalVatGap.toLocaleString('en-US', {maximumFractionDigits: 0}) }}
              <v-spacer></v-spacer>
              Payments - {{ totalPayed.toLocaleString('en-US', {maximumFractionDigits: 0}) }} ({{ getPercentage(totalPayed, totalSales) }}%)
              <v-spacer></v-spacer>
              Buyer Changes - {{ totalBuyerChanges.toLocaleString('en-US', {maximumFractionDigits: 0}) }}
              <v-spacer></v-spacer>
              Total - {{ totalSales.toLocaleString() }}
              <v-spacer></v-spacer>
              <export-excel
                :data="$formatDataForExport(holdersExportData)"
                type="xlsx"
                name="holders"
                title="Holders">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <v-spacer></v-spacer>
              <v-btn x-small @click="getHolderForEdit">
                <v-icon small>mdi-plus</v-icon>
              </v-btn>
            </v-toolbar> -->
          </template>
          <template v-slot:[`item.flatId`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ String(item.flatId).padStart(2, '0') }}</span>
          </template>
          <template v-slot:[`item.signDate`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.signDate | formatDate }}</span>
          </template>
          <template v-slot:[`item.signPrice`]="{ item }">
            <span style="margin-left: 0.5rem"> {{ item.signPrice ? item.signPrice.toLocaleString() : '' }}</span>
          </template>
          <template v-slot:[`item.paidThrough2024`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.paidThrough2024) }}</span>
          </template>
          <template v-slot:[`item.paidFrom2025`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.paidFrom2025) }}</span>
          </template>
          <template v-slot:[`item.vatGap`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.vatGap) }}</span>
          </template>
          <template v-slot:[`item.buyerChanges`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.buyerChanges) }}</span>
          </template>
          <template v-slot:[`item.remainingBalance`]="{ item }">
            <span style="margin-left: 0.5rem">
              {{ formatOptionalNumber(item.remainingBalance) }}
              <template v-if="item.remainingBalance !== null && item.remainingBalance !== undefined && Number(item.signPrice)">
                ({{ getWholePercentage(item.remainingBalance, item.signPrice) }}%)
              </template>
            </span>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" style="text-align: -webkit-center;">
							<v-data-table 
								:headers="paymentHeaders"
								:items="item.bookEntries"
								dense
								disable-pagination
								hide-default-footer
								mobile-breakpoint="0"
                class="expanded-datatable">
                <template v-slot:[`item.schum_hova`]="{ item }">
                  <span>{{ formatNumber(item.schum_hova) }}</span>
                </template>
                <template v-slot:[`item.schum_zchut`]="{ item }">
                  <span>{{ formatNumber(item.schum_zchut) }}</span>
                </template>
                <template v-slot:[`item.asmchta_date`]="{ item }">
                  <span>{{ item.asmchta_date | formatDate }}</span>
                </template>
              </v-data-table>
            </td>
          </template>
        </v-data-table>
      </v-flex>

      <holder-form ref="holderForm"/>

    </v-layout>
  </div>
</template>



<script>
import Vue from "vue";
import moment from "moment";
import apiService from "../services/apiService";
import { BOOKS_MODEL, HOLDER_MODEL, HOLDER_HEADERS, TABLE_IDS, TABLE_MODEL } from "../constants/constants";
import { isMobile } from '../constants/constants';
import HolderForm from './HolderForm.vue';
import VueApexCharts from 'vue-apexcharts';
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	// name: "holders-list",
	components: { HolderForm, apexchart: VueApexCharts },
	data() {
		return {
      isMobile,
			holdersList: [],
			holdersCount: '',
			// dialog: false,

      paymentHeaders: [
				{ text: "Date", value: "asmchta_date", align: "right" },
				{ text: "Description", value: "pratim", align: "right" },
				{ text: "Debit", value: "schum_hova", align: "right" },
				{ text: "Credit", value: "schum_zchut", align: "right" },
				{ text: "Category", value: "paymentCategory", align: "right" },
				{ text: "Reference", value: "asmacta1", align: "right" },
      ],
			search: "",
			headers: [],
      expanded: [],
      selectedSaleFlatId: null,
      dateModal : false,
      isLoading : false,
      totalPayed: 0,
      totalSales: 0,
      totalRemaining: 0,
      totalVatGap: 0,
      totalBuyerChanges: 0,
		};
	},

          /* eslint-disable */
	methods: {
    selectSaleFlat(event, chartContext, { dataPointIndex }) {
      const holder = this.soldFlats[dataPointIndex];
      this.selectedSaleFlatId = holder ? holder.flatId : null;
    },
		async getHolders() {
      this.isLoading = true;
      this.holdersCount = 0;
      this.totalSales = 0;
      this.totalPayed = 0;
      this.totalRemaining = 0;
      this.totalVatGap = 0;
      this.totalBuyerChanges = 0;

      try {
        // Here we fetch the holders and the flat-to-account mapping from table 25 in bulk.
        const [holdersResponse, tableResponse] = await Promise.all([
          apiService.clientGetEntities(HOLDER_MODEL),
          apiService.clientGetEntities(TABLE_MODEL, { table_id: TABLE_IDS.YAZAMUT_HOLDERS }),
        ]);

        const holders = holdersResponse.data || [];
        const tableRows = tableResponse.data || [];
        const flatToCard = this.buildFlatToCardMap(tableRows);
        const cardIds = [...new Set(Object.values(flatToCard))];
        let bookRows = [];

        // Here we fetch all relevant Book entries once, instead of sending one request per flat.
        if (cardIds.length) {
          const bookResponse = await apiService.clientGetEntities(BOOKS_MODEL, {
            filter: JSON.stringify({
              company: 'יזמות',
              cust_id: { $in: cardIds },
              sort_code: { $in: [100, 150] },
            }),
          });
          bookRows = bookResponse.data || [];
        }

        const booksByCard = this.groupBooksByCard(bookRows);

        this.holdersList = holders.map((holder) => {
          const cardId = flatToCard[Number(holder.flatId)];
          const matchingBooks = cardId ? (booksByCard[cardId] || []) : [];

          if (holder.holderName) {
            this.holdersCount += 1;
            this.totalSales += Number(holder.signPrice) || 0;
          }

          // A missing table-25 mapping remains blank in the two calculated columns.
          if (!cardId) {
            return {
              ...holder,
              signDate: this.formatStoredDate(holder.signDate),
              paid: null,
              paidThrough2024: null,
              paidFrom2025: null,
              vatGap: null,
              buyerChanges: null,
              remainingBalance: null,
              bookEntries: [],
            };
          }

          const totals = this.summarizeBookEntries(cardId, matchingBooks);
          // Toolbar Payments represents apartment payments only; Buyer Changes stay separate.
          this.totalPayed += totals.paid;
          this.totalBuyerChanges += totals.buyerChanges;
          const vatGap = this.calculateVatGap(holder, cardId, totals);
          if (vatGap !== null) {
            this.totalVatGap += vatGap;
          }
          const remainingBalance = this.calculateRemainingBalance(holder, cardId, totals);
          if (remainingBalance !== null) {
            this.totalRemaining += remainingBalance;
          }

          return {
            ...holder,
            signDate: this.formatStoredDate(holder.signDate),
            paid: totals.paid,
            paidThrough2024: totals.paidThrough2024 || null,
            paidFrom2025: totals.paidFrom2025 || null,
            vatGap,
            buyerChanges: totals.buyerChanges || null,
            remainingBalance,
            bookEntries: totals.bookEntries,
          };
        });
      } catch (error) {
        console.log(error);
        this.holdersList = [];
      } finally {
        this.isLoading = false;
      }
		},

    buildFlatToCardMap(tableRows) {
      return tableRows.reduce((mapping, tableRow) => {
        // Table 25 descriptions start with the two-digit flat ID, for example "03- בסיל".
        const match = String(tableRow.description || '').match(/^\s*(\d{2})/);
        const cardId = Number(tableRow.table_code);
        if (match && cardId) {
          mapping[Number(match[1])] = cardId;
        }
        return mapping;
      }, {});
    },

    groupBooksByCard(bookRows) {
      return bookRows.reduce((groups, bookRow) => {
        const cardId = Number(bookRow.cust_id);
        if (!groups[cardId]) groups[cardId] = [];
        groups[cardId].push(bookRow);
        return groups;
      }, {});
    },

    summarizeBookEntries(cardId, bookEntries) {
      let paid = 0;
      let paidThrough2024 = 0;
      let buyerChanges = 0;
      let creditTotal = 0;
      let hasInvalidApartmentPaymentDate = false;

      const preparedEntries = bookEntries
        .map((bookEntry) => {
          const debit = Number(bookEntry.schum_hova) || 0;
          const credit = Number(bookEntry.schum_zchut) || 0;
          let paymentCategory = '';

          creditTotal += credit;

          // Debit descriptions explain whether the received money paid for the flat or buyer changes.
          if (debit > 0) {
            if (this.isBuyerChangesDescription(bookEntry.pratim)) {
              buyerChanges += debit;
              paymentCategory = 'Buyer Changes';
            } else {
              paid += debit;
              paymentCategory = 'Paid';

              // Track pre-2025 apartment payments separately for the informational VAT Gap.
              const paymentVatMultiplier = this.getVatMultiplier(bookEntry.asmchta_date);
              if (paymentVatMultiplier) {
                if (paymentVatMultiplier === 1.17) {
                  paidThrough2024 += debit;
                }
              } else {
                hasInvalidApartmentPaymentDate = true;
                console.warn(`Invalid apartment payment date for card ${cardId}, Book record ${bookEntry._id}`);
              }
            }
          }

          return { ...bookEntry, paymentCategory };
        })
        .sort((a, b) => new Date(b.asmchta_date) - new Date(a.asmchta_date));

      // Credits and classified debits should balance; warn if an imported card does not.
      // const difference = creditTotal - paid - buyerChanges;
      // if (Math.abs(difference) > 0.01) {
      //   console.warn(`Book totals do not balance for card ${cardId}. Difference: ${difference}`);
      // }

      return {
        paid,
        paidThrough2024,
        paidFrom2025: paid - paidThrough2024,
        buyerChanges,
        hasInvalidApartmentPaymentDate,
        bookEntries: preparedEntries,
      };
    },

    getVatMultiplier(date) {
      const effectiveDate = moment(date);
      if (!effectiveDate.isValid()) return null;

      // Israeli VAT was 17% through 2024 and is 18% for payments effective from 01/01/2025.
      return effectiveDate.isBefore('2025-01-01', 'day') ? 1.17 : 1.18;
    },

    calculateVatGap(holder, cardId, totals) {
      const hasSignPrice = holder.signPrice !== null && holder.signPrice !== undefined && holder.signPrice !== '';
      const signPrice = Number(holder.signPrice);
      const signVatMultiplier = this.getVatMultiplier(holder.signDate);

      if (!hasSignPrice || !Number.isFinite(signPrice) || !signVatMultiplier || totals.hasInvalidApartmentPaymentDate) {
        console.warn(`Cannot calculate VAT Gap for flat ${holder.flatId}, card ${cardId}`);
        return null;
      }

      // Contracts signed at 18% have no gap. For older contracts, only the balance unpaid on 01/01/2025 changed VAT.
      if (signVatMultiplier === 1.18) return null;
      const balanceEntering2025 = signPrice - totals.paidThrough2024;

      // A contract already fully paid before the rate change has no VAT gap to display.
      if (balanceEntering2025 <= 0) return null;
      return Math.round((balanceEntering2025 / 1.17) * 0.01);
    },

    calculateRemainingBalance(holder, cardId, totals) {
      const hasSignPrice = holder.signPrice !== null && holder.signPrice !== undefined && holder.signPrice !== '';
      const signPrice = Number(holder.signPrice);

      if (!hasSignPrice || !Number.isFinite(signPrice)) {
        console.warn(`Cannot calculate Remaining Balance for flat ${holder.flatId}, card ${cardId}`);
        return null;
      }

      // VAT Gap is informational only; Remaining must reconcile directly with Total and apartment Payments.
      return signPrice - totals.paid;
    },

    isBuyerChangesDescription(value) {
      const description = String(value || '')
        .normalize('NFKC')
        .replace(/["'`׳״.,:;()\-_/\\]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // This stem covers both "שינוי דיירים" and "שינויי דיירים", including longer descriptions.
      return /שינויי?\s*דייר/.test(description);
    },

    formatStoredDate(value) {
      return value ? moment(value).format('YYYY-MM-DD') : value;
    },

    formatNumber(value) {
      return (Number(value) || 0).toLocaleString();
    },

    formatTotal(value) {
      return (Number(value) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
    },

    formatOptionalNumber(value) {
      return value === null || value === undefined ? '' : this.formatNumber(value);
    },

    getPercentage(part, total) {
      if (!Number(total) || !Number.isFinite(Number(total))) return '0.0';
      return ((Number(part) / Number(total)) * 100).toFixed(1);
    },

    getWholePercentage(part, total) {
      if (!Number(total) || !Number.isFinite(Number(total))) return 0;
      return Math.round((Number(part) / Number(total)) * 100);
    },

		getHeaders() {
			if (this.isMobile()) {
				return HOLDER_HEADERS;
			} else {
				return HOLDER_HEADERS;
			}
		},

    async getHolderForEdit(item) {
			if (item._id) { // this is update holder
			  await this.$refs.holderForm.open(item, false);
      }
      this.getHolders();
		},
	},

	async mounted() {
		this.getHolders();
	},
	
  computed: {
    mobileView() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    selectedSaleFlat() {
      return this.soldFlats.find(holder => holder.flatId === this.selectedSaleFlatId);
    },
    filteredMobileHolders() {
      const query = String(this.search || '').trim().toLocaleLowerCase();

      return this.holdersList
        .filter(holder => holder.holderName && (
          !query || this.getHeaders().some(header =>
            String(holder[header.value] ?? '')
              .toLocaleLowerCase()
              .includes(query)
          )
        ))
        .sort((a, b) => Number(a.flatId) - Number(b.flatId));
    },
    soldFlats() {
      return this.holdersList
        .filter(holder => holder.holderName)
        .slice()
        .sort((a, b) => Number(a.flatId) - Number(b.flatId));
    },
    salePriceChartSeries() {
      const prices = this.soldFlats.map(holder => {
        const price = Number(holder.signPrice);
        return holder.signPrice === null || holder.signPrice === undefined || holder.signPrice === '' || !Number.isFinite(price)
          ? null : price;
      });
      const payments = this.soldFlats.map(holder => Number(holder.paid) || 0);
      return [
        { name: 'Payments', data: prices.map((price, index) => price === null ? null : payments[index]) },
        { name: 'Remaining', data: prices.map((price, index) => price === null ? null : price - payments[index]) },
      ];
    },
    salePriceChartOptions() {
      return {
        chart: { stacked: true, toolbar: { show: false }, animations: { enabled: false } },
        colors: ['#e53935', '#1976d2'],
        plotOptions: {
          bar: {
            columnWidth: '65%',
            dataLabels: {
              total: {
                enabled: true,
                formatter: (value, { dataPointIndex }) => {
                  const holder = this.soldFlats[dataPointIndex];
                  return holder ? this.formatOptionalNumber(holder.signPrice === null || holder.signPrice === undefined || holder.signPrice === '' ? null : Number(holder.signPrice) / 1000) : '';
                },
                offsetY: -8,
                style: { color: '#333', fontSize: '11px', fontWeight: 400 },
              },
            },
          },
        },
        dataLabels: { enabled: false },
        legend: { onItemClick: { toggleDataSeries: false } },
        grid: { padding: { top: 24 } },
        xaxis: {
          categories: this.soldFlats.map(holder => String(holder.flatId).padStart(2, '0')),
          // title: { text: 'Flat number' },
        },
        yaxis: {
          // title: { text: 'Contract price' },
          labels: { formatter: value => this.formatNumber(value) },
        },
        tooltip: {
          shared: !this.mobileView,
          intersect: this.mobileView,
          x: {
            formatter: (value, { dataPointIndex }) => {
              const holder = this.soldFlats[dataPointIndex];
              return holder ? `Flat ${String(holder.flatId).padStart(2, '0')} · ${holder.holderName}` : value;
            },
          },
          y: { formatter: value => this.formatOptionalNumber(value) },
        },
      };
    },
    holdersExportData() {
      // Export the visible holder summary only; detailed Book entries remain in the read-only expansion.
      return this.holdersList.map((holder) => ({
        FlatID: holder.flatId,
        holderName: holder.holderName,
        phone: holder.phone,
        signDate: holder.signDate,
        signPrice: holder.signPrice,
        'Paid -2024': holder.paidThrough2024,
        'Paid 2025+': holder.paidFrom2025,
        'VAT Gap': holder.vatGap,
        'Remaining Balance': holder.remainingBalance,
        'Buyer Changes': holder.buyerChanges,
        remark: holder.remark,
        email: holder.email,
      }));
    },
  },

  watch: {},
};
</script>

<style scoped>
.list > .layout,
.list > .layout > .flex {
  min-width: 0;
}

.chart-scroll {
  overflow-x: auto;
  direction: ltr;
  max-width: 100%;
}

.mobile-summary,
.buyer-card {
  background: white;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  text-align: right;
  overflow-wrap: anywhere;
}

.mobile-summary h2,
.buyer-heading h3 {
  font-size: 1rem;
  margin: 0;
}

.mobile-figures {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.mobile-figures span,
.mobile-figures strong {
  display: block;
}

.mobile-figures span,
.chart-hint {
  font-size: 0.8rem;
  color: #555;
}

.mobile-figures strong {
  font-variant-numeric: tabular-nums;
}

.buyer-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.buyer-details {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px 16px;
  margin: 16px 0;
}

.buyer-details dd {
  margin: 0;
  white-space: pre-line;
}

.buyer-card summary {
  cursor: pointer;
  padding: 12px 0;
  min-height: 44px;
}

.payment-card {
  border-top: 1px solid #ddd;
  padding-bottom: 8px;
}

.payment-card summary span {
  display: block;
  margin-top: 4px;
}

.selected-flat {
  direction: rtl;
  text-align: right;
  padding: 12px;
  background: #f3f6fa;
  border-radius: 6px;
  overflow-wrap: anywhere;
}

@media (max-width: 959px) {
  .list {
    width: 100%;
  }

  .sale-price-chart h3,
  .chart-hint {
    direction: rtl;
    text-align: right;
  }
}

.sale-price-chart {
  direction: ltr;
  text-align: left;
  background: white;
  padding: 16px;
  margin-bottom: 16px;
}

.sale-price-chart h3 {
  margin-bottom: 8px;
  font-size: 1rem;
}

.list {
  text-align: left;
  max-width: 100%;
  margin: auto;
}

.link {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
  float: right;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
}

.v-toolbar__title {
    font-size: 1rem;
    white-space: pre-line;
}

.expanded-datatable{
	width: 70%;
  margin-bottom: 12px;
  border: 5px solid #98e983;
	cursor: pointer;
}

.text {
  font-size: 3px;
}

.hebrew {
  direction: rtl;
  /* text-align-last: right; */
}
</style>
