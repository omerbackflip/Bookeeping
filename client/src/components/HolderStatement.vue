<template>
  <v-dialog v-model="visible" max-width="900" scrollable>
    <v-card dir="rtl">
      <v-card-title>מצב חשבון — דירה {{ holder.flatId }}</v-card-title>
      <v-card-text>
        <p v-if="!available">לא ניתן להפיק מצב חשבון: חסרים מחיר חוזה או שיוך לכרטיס הנהלת חשבונות.</p>
        <div v-else ref="statement" class="holder-statement" dir="rtl">
          <header class="statement-header">
            <img class="statement-logo" src="../assets/gadot-logo.png" alt="GADOT — גדות יזמות">
            <h1>גדות סקיי - מצב חשבון - דירה {{ holder.flatId }}</h1>
            <p>נכון ליום: <strong>{{ statementDate }}</strong></p>
            <div class="statement-details">
              <p>שם הרוכש: <strong>{{ holder.holderName }}</strong></p>
              <p>תאריך חתימת חוזה: <strong>{{ date(holder.signDate) }}</strong></p>
            </div>
          </header>
          <table class="statement-summary">
            <colgroup><col style="width: 72%"><col style="width: 28%"></colgroup>
            <thead><tr><th>סיכום החשבון</th><th>סכום</th></tr></thead>
            <tbody>
              <tr><th>מחיר הדירה לפי החוזה, כולל מע״מ</th><td>{{ money(holder.signPrice) }}</td></tr>
              <tr v-if="needsVatCalculation"><th>שולם עד 31/12/2024 — מע״מ 17%</th><td>{{ money(holder.paidThrough2024) }}</td></tr>
              <tr v-if="needsVatCalculation"><th>שולם מ־01/01/2025 — מע״מ 18%</th><td>{{ money(holder.paidFrom2025) }}</td></tr>
              <tr v-if="needsVatCalculation"><th>הפרש מע״מ בגין המעבר מ־17% ל־18%</th><td>{{ holder.vatGap == null ? '—' : money(holder.vatGap) }}</td></tr>
              <tr class="emphasis"><th>סה״כ שולם עבור הדירה</th><td>{{ money(holder.paid) }}</td></tr>
              <tr class="emphasis"><th>{{ balanceIncludingVat < 0 ? 'יתרת זכות' : 'יתרה לתשלום' }}</th><td>{{ money(Math.abs(balanceIncludingVat)) }}</td></tr>
            </tbody>
          </table>
          <h2>פירוט תשלומים עבור הדירה</h2>
          <table class="statement-payments">
            <colgroup><col style="width: 19%"><col style="width: 15%"><col :style="{ width: needsVatCalculation ? '30%' : '42%' }"><col v-if="needsVatCalculation" style="width: 12%"><col style="width: 24%"></colgroup>
            <thead><tr><th>תאריך תשלום</th><th>אסמכתא</th><th>תיאור</th><th v-if="needsVatCalculation">שיעור מע״מ</th><th>סכום ששולם</th></tr></thead>
            <tbody>
              <tr v-for="(entry, index) in payments" :key="entry._id || index">
                <td>{{ date(entry.asmchta_date) }}</td><td>{{ entry.asmacta1 || '—' }}</td>
                <td>{{ entry.pratim || 'תשלום על חשבון הדירה' }}</td><td v-if="needsVatCalculation">{{ vat(entry.asmchta_date) }}</td><td>{{ money(entry.schum_hova) }}</td>
              </tr>
              <tr v-if="!payments.length"><td :colspan="needsVatCalculation ? 5 : 4">לא נרשמו תשלומים עבור הדירה</td></tr>
            </tbody>
            <tfoot><tr><th :colspan="needsVatCalculation ? 4 : 3">סה״כ שולם</th><td>{{ money(holder.paid) }}</td></tr></tfoot>
          </table>
          <footer class="statement-footer">
            <table v-if="needsVatCalculation && holder.vatGap != null" class="statement-summary statement-final">
              <colgroup><col style="width: 72%"><col style="width: 28%"></colgroup>
              <tbody><tr class="emphasis"><th>{{  'יתרה לתשלום' }}</th><td>{{ money(Math.abs(balanceIncludingVat)) }}</td></tr></tbody>
            </table>
            <p class="statement-note">לתשומת לבכם: כל איחור בתשלום יגרום לביטול ההנחה בגין הצמדה למדד.</p>
            <p class="statement-note">הדוח מתייחס לרכישת הדירה בלבד. חיובים ותשלומים בגין שינויי דיירים אינם נכללים.</p>
            <p class="statement-note">כל הסכומים בש״ח וכוללים מע״מ, ומוצגים בעיגול לשקל שלם.</p>
          </footer>
        </div>
        <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-btn text :disabled="exporting" @click="visible = false">סגירה</v-btn>
        <v-spacer />
        <v-btn color="primary" :disabled="!available" :loading="exporting" @click="download">הורדה כ־PDF</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment';
import { generatePdfFromElement } from './shared/pdf';

export default {
  data: () => ({ visible: false, holder: {}, statementDate: '', fileDate: '', exporting: false, error: '' }),
  computed: {
    needsVatCalculation() {
      return Boolean(this.holder.signDate) && moment(this.holder.signDate).isValid()
        && moment(this.holder.signDate).isBefore('2025-01-01', 'day');
    },
    balanceIncludingVat() {
      return Number(this.holder.remainingBalance) + (this.needsVatCalculation ? Number(this.holder.vatGap || 0) : 0);
    },
    available() {
      return this.holder.remainingBalance != null && this.holder.paid != null;
    },
    payments() {
      return (this.holder.bookEntries || []).filter(entry => entry.paymentCategory === 'Paid')
        .slice().sort((a, b) => new Date(a.asmchta_date) - new Date(b.asmchta_date));
    },
  },
  methods: {
    open(holder) {
      this.holder = holder;
      this.statementDate = moment().format('DD/MM/YYYY');
      this.fileDate = moment().format('YYYY-MM-DD');
      this.error = '';
      this.visible = true;
    },
    money(value) {
      return `${(Number(value) || 0).toLocaleString('he-IL', { maximumFractionDigits: 0 })} ₪`;
    },
    date(value) {
      return value && moment(value).isValid() ? moment(value).format('DD/MM/YYYY') : '—';
    },
    vat(value) {
      if (!value || !moment(value).isValid()) return '—';
      return moment(value).isBefore('2025-01-01', 'day') ? '17%' : '18%';
    },
    async download() {
      this.exporting = true;
      this.error = '';
      try {
        await this.$nextTick();
        await document.fonts.ready;
        await Promise.all(Array.from(this.$refs.statement.querySelectorAll('img')).map(image => image.decode()));
        await generatePdfFromElement(this.$refs.statement, `מצב-חשבון-דירה-${this.holder.flatId}-${this.fileDate}.pdf`);
      } catch (error) {
        this.error = 'הפקת ה־PDF נכשלה. ניתן לנסות שוב.';
      } finally {
        this.exporting = false;
      }
    },
  },
};
</script>

<style scoped>
.holder-statement { background: white; color: #222; padding: 20px; text-align: right; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; }
.holder-statement h1 { font-size: 24px; margin: 0 0 8px; }
.statement-header { margin-bottom: 24px; break-inside: avoid; display: flow-root; }
.statement-logo { float: left; width: 110px; height: 110px; object-fit: contain; margin: 0 20px 12px 0; }
.statement-header p { margin: 4px 0; }
.statement-details { margin-top: 18px; }
.holder-statement h2 { font-size: 18px; margin: 24px 0 10px; page-break-after: avoid; }
.holder-statement table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.holder-statement th, .holder-statement td { border-bottom: 1px solid #ccc; padding: 8px; text-align: right; overflow-wrap: anywhere; }
.statement-summary tbody th { font-weight: normal; }
.holder-statement thead { background: #f1f3f5; font-weight: bold; }
.statement-final { border-top: 2px solid #555; border-bottom: 2px solid #555; }
.statement-summary td, .statement-payments td:first-child, .statement-payments td:last-child { white-space: nowrap; }
.statement-summary td, .statement-payments td:last-child { font-variant-numeric: tabular-nums; }
.holder-statement .emphasis, .holder-statement tfoot { font-weight: bold; background: #f1f3f5; }
.holder-statement .emphasis th { font-weight: bold; }
.holder-statement tr { break-inside: avoid; page-break-inside: avoid; }
.statement-summary { break-inside: avoid; page-break-inside: avoid; }
.statement-footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; }
.statement-note { font-size: 12px; margin: 6px 0 0; }
</style>
