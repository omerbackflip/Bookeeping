<template>
  <div class="list row hebrew">
    <v-layout>
      <v-flex>
        <v-data-table
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
            <v-toolbar flat>
              <v-toolbar-title> Sales - {{holdersCount}}/{{holdersList.length}} </v-toolbar-title>
              <v-spacer></v-spacer>
              Total - {{ totalSales.toLocaleString() }}
              <v-spacer></v-spacer>
              Payments - {{ totalPayed.toLocaleString() }}
              <v-spacer></v-spacer>
              Remaining - {{ totalRemaining.toLocaleString() }}
              <v-spacer></v-spacer>
              <v-text-field v-model="search" label="Search" class="mx-4" clearable></v-text-field>
              <!-- <v-spacer></v-spacer>
              <v-btn x-small @click="getHolderForEdit">
                <v-icon small>mdi-plus</v-icon>
              </v-btn> -->
            </v-toolbar>
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
          <template v-slot:[`item.paid`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.paid) }}</span>
          </template>
          <template v-slot:[`item.vatGap`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.vatGap) }}</span>
          </template>
          <template v-slot:[`item.buyerChanges`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.buyerChanges) }}</span>
          </template>
          <template v-slot:[`item.remainingBalance`]="{ item }">
            <span style="margin-left: 0.5rem">{{ formatOptionalNumber(item.remainingBalance) }}</span>
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
Vue.filter("formatDate", function (value) {
	if (value) {
		//return moment(String(value)).format('MM/DD/YYYY hh:mm')
		return moment(String(value)).format("DD/MM/YYYY");
	}
});
export default {
	// name: "holders-list",
	components: { HolderForm },
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
      dateModal : false,
      isLoading : false,
      totalPayed: 0,
      totalSales: 0,
      totalRemaining: 0,
		};
	},

          /* eslint-disable */
	methods: {
		async getHolders() {
      this.isLoading = true;
      this.holdersCount = 0;
      this.totalSales = 0;
      this.totalPayed = 0;
      this.totalRemaining = 0;

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
              vatGap: null,
              buyerChanges: null,
              remainingBalance: null,
              bookEntries: [],
            };
          }

          const totals = this.summarizeBookEntries(cardId, matchingBooks);
          this.totalPayed += totals.paid + totals.buyerChanges;
          const vatGap = this.calculateVatGap(holder, cardId, totals);
          const remainingBalance = this.calculateRemainingBalance(holder, cardId, totals);
          if (remainingBalance !== null) {
            this.totalRemaining += remainingBalance;
          }

          return {
            ...holder,
            signDate: this.formatStoredDate(holder.signDate),
            paid: totals.paid,
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
      let paidBeforeVat = 0;
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

              // Apartment payments are converted to net amounts using the VAT rate on their effective date.
              const paymentVatMultiplier = this.getVatMultiplier(bookEntry.asmchta_date);
              if (paymentVatMultiplier) {
                paidBeforeVat += debit / paymentVatMultiplier;
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
      const difference = creditTotal - paid - buyerChanges;
      if (Math.abs(difference) > 0.01) {
        console.warn(`Book totals do not balance for card ${cardId}. Difference: ${difference}`);
      }

      return {
        paid,
        paidBeforeVat,
        paidThrough2024,
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
      const signVatMultiplier = this.getVatMultiplier(holder.signDate);

      // Do not show an estimated balance when required accounting dates or the signed price are missing.
      if (!hasSignPrice || !Number.isFinite(signPrice) || !signVatMultiplier || totals.hasInvalidApartmentPaymentDate) {
        console.warn(`Cannot calculate Remaining Balance for flat ${holder.flatId}, card ${cardId}`);
        return null;
      }

      const signedPriceBeforeVat = signPrice / signVatMultiplier;
      const remainingBeforeVat = signedPriceBeforeVat - totals.paidBeforeVat;

      // The unpaid net balance is due at the current 18% VAT rate. Negative results expose overpayment.
      return Math.round(remainingBeforeVat * 1.18);
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

    formatOptionalNumber(value) {
      return value === null || value === undefined ? '' : this.formatNumber(value);
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
	
  watch: {

	},
};
</script>

<style scoped>
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
