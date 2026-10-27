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
            <thead><tr><th>סיכום החשבון
              <v-btn v-if="!exporting" data-html2canvas-ignore="true" x-small text @click="editingSummary = !editingSummary">
                <v-icon small>{{ editingSummary ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
                {{ editingSummary ? 'סיום עריכה' : 'עריכה' }}
              </v-btn>
            </th><th>סכום</th></tr></thead>
            <tbody>
              <tr><th>מחיר הדירה לפי החוזה, כולל מע״מ</th><td><input v-if="summaryEditing" v-model="summaryDraft.signPrice" type="number" min="0" step="any" aria-label="מחיר הדירה לפי החוזה"><template v-else>{{ money(summaryPrice) }}</template></td></tr>
              <tr v-if="needsVatCalculation"><th>שולם עד 31/12/2024 — מע״מ 17%</th><td><input v-if="summaryEditing" :value="summaryTotals.paidThrough2024" @input="summaryDraft.paidThrough2024 = $event.target.value" type="number" min="0" step="any" aria-label="שולם עד סוף 2024"><template v-else>{{ money(summaryTotals.paidThrough2024) }}</template></td></tr>
              <tr v-if="needsVatCalculation"><th>שולם מ־01/01/2025 — מע״מ 18%</th><td><input v-if="summaryEditing" :value="summaryTotals.paidFrom2025" @input="summaryDraft.paidFrom2025 = $event.target.value" type="number" min="0" step="any" aria-label="שולם משנת 2025"><template v-else>{{ money(summaryTotals.paidFrom2025) }}</template></td></tr>
              <tr v-if="needsVatCalculation"><th>הפרש מע״מ בגין המעבר מ־17% ל־18%</th><td><input v-if="summaryEditing" :value="summaryTotals.vatGap" @input="summaryDraft.vatGap = $event.target.value" type="number" min="0" step="any" aria-label="הפרש מע״מ"><template v-else>{{ money(summaryTotals.vatGap) }}</template></td></tr>
              <tr class="emphasis"><th>סה״כ שולם עבור הדירה</th><td><input v-if="summaryEditing && !needsVatCalculation" :value="summaryTotals.paid" @input="summaryDraft.paid = $event.target.value" type="number" min="0" step="any" aria-label="סה״כ שולם עבור הדירה"><template v-else>{{ money(summaryTotals.paid) }}</template></td></tr>
              <tr class="emphasis"><th>{{ balanceBeforeIndexation < 0 ? 'יתרת זכות' : 'יתרה לתשלום' }}</th><td>{{ money(Math.abs(balanceBeforeIndexation)) }}</td></tr>
              <tr>
                <th>
                  הפרשי הצמדה למדד תשומות הבנייה —
                  <template v-if="summaryEditing">
                    <label>מדד בסיס <input class="index-input" v-model="indexDraft.base" type="number" min="0" step="any" aria-label="מדד בסיס"></label>
                    <label>מדד נוכחי <input class="index-input" v-model="indexDraft.current" type="number" min="0" step="any" aria-label="מדד נוכחי"></label>
                  </template>
                  <template v-else>מדד בסיס {{ indexDraft.base }}; מדד נוכחי {{ indexDraft.current }}</template>
                </th>
                <td>{{ money(indexCalculation.beforeDiscount) }}</td>
              </tr>
              <tr v-if="!exporting || Number(indexDraft.discount) !== 0">
                <th>הנחה על הפרשי ההצמדה —
                  <input v-if="summaryEditing" class="index-input" v-model="indexDraft.discount" type="number" min="0" max="100" step="any" aria-label="הנחה על הפרשי ההצמדה">
                  <template v-else>{{ indexDraft.discount }}</template>%
                </th>
                <td>{{ money(-indexCalculation.discountAmount) }}</td>
              </tr>
              <tr class="emphasis"><th>{{ balanceIncludingVat < 0 ? 'יתרת זכות לאחר הצמדה' : 'יתרה לתשלום לאחר הצמדה' }}</th><td>{{ money(Math.abs(balanceIncludingVat)) }}</td></tr>
            </tbody>
          </table>
          <div v-if="summaryEditing" data-html2canvas-ignore="true" class="payment-edit-actions">
            <v-btn small text @click="resetSummary">איפוס סיכום החשבון</v-btn>
            <p>עריכת הסיכום משפיעה על היתרה בלבד ואינה משנה את פירוט התשלומים. עריכת תשלומים מחדש תאפס את סכומי התשלום והמע״מ שהוזנו בסיכום. היתרה מחושבת אוטומטית.</p>
          </div>
          <v-alert v-if="!validSummary && !exporting" data-html2canvas-ignore="true" type="warning" dense>יש להזין סכומים תקינים שאינם שליליים, מדדים גדולים מאפס והנחה בין 0% ל־100%.</v-alert>
          <div class="payment-heading">
            <h2>פירוט תשלומים עבור הדירה</h2>
            <v-btn v-if="!exporting" data-html2canvas-ignore="true" x-small text @click="editing = !editing">
              <v-icon small>{{ editing ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
              {{ editing ? 'סיום עריכה' : 'עריכה' }}
            </v-btn>
          </div>
          <table class="statement-payments">
            <colgroup><col style="width: 19%"><col style="width: 15%"><col :style="{ width: needsVatCalculation ? '30%' : '42%' }"><col v-if="needsVatCalculation" style="width: 12%"><col style="width: 24%"></colgroup>
            <thead><tr><th>תאריך תשלום</th><th>אסמכתא</th><th>תיאור</th><th v-if="needsVatCalculation">שיעור מע״מ</th><th>סכום ששולם</th></tr></thead>
            <tbody>
              <tr v-for="(entry, index) in (paymentEditing ? draftPayments : payments)" :key="entry.statementKey">
                <td><input v-if="paymentEditing" v-model="entry.asmchta_date" type="date" aria-label="תאריך תשלום"><template v-else>{{ date(entry.asmchta_date) }}</template></td>
                <td><input v-if="paymentEditing" v-model="entry.asmacta1" aria-label="אסמכתא"><template v-else>{{ entry.asmacta1 || '—' }}</template></td>
                <td><input v-if="paymentEditing" v-model="entry.pratim" aria-label="תיאור"><template v-else>{{ entry.pratim || 'תשלום על חשבון הדירה' }}</template></td>
                <td v-if="needsVatCalculation">{{ vat(entry.asmchta_date) }}</td>
                <td>
                  <template v-if="paymentEditing">
                    <input v-model="entry.schum_hova" type="number" min="0.01" step="any" aria-label="סכום ששולם">
                    <v-btn icon x-small :aria-label="'מחיקת תשלום ' + (index + 1)" @click="draftPayments.splice(index, 1)"><v-icon small>mdi-delete</v-icon></v-btn>
                  </template>
                  <template v-else>{{ money(entry.schum_hova) }}</template>
                </td>
              </tr>
              <tr v-if="!payments.length"><td :colspan="needsVatCalculation ? 5 : 4">לא נרשמו תשלומים עבור הדירה</td></tr>
            </tbody>
            <tfoot><tr><th :colspan="needsVatCalculation ? 4 : 3">סה״כ שולם</th><td>{{ money(paymentTotals.paid) }}</td></tr></tfoot>
          </table>
          <div v-if="paymentEditing" data-html2canvas-ignore="true" class="payment-edit-actions">
            <v-btn small text @click="addPayment">הוספת תשלום</v-btn>
            <v-btn small text @click="resetPayments">איפוס לתשלומים המקוריים</v-btn>
          </div>
          <v-alert v-if="!validPayments && !exporting" data-html2canvas-ignore="true" type="warning" dense>יש להזין לכל תשלום תאריך תקין וסכום חיובי לפני הורדת ה־PDF.</v-alert>
          <div class="payment-heading">
            <h2>חיובים נוספים לפי החוזה</h2>
            <v-btn v-if="!exporting" data-html2canvas-ignore="true" x-small text @click="editingCharges = !editingCharges">
              <v-icon small>{{ editingCharges ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
              {{ editingCharges ? 'סיום עריכה' : 'עריכה' }}
            </v-btn>
          </div>
          <table class="statement-charges">
            <colgroup><col style="width: 14%"><col style="width: 60%"><col style="width: 26%"></colgroup>
            <thead><tr><th>סעיף בחוזה</th><th>תיאור החיוב</th><th>סכום לתשלום כולל מע״מ</th></tr></thead>
            <tbody>
              <tr v-for="(charge, index) in draftCharges" :key="charge.key">
                <td><input v-if="chargesEditing" v-model="charge.clause" aria-label="סעיף בחוזה"><template v-else>{{ charge.clause || '—' }}</template></td>
                <td><input v-if="chargesEditing" v-model="charge.description" aria-label="תיאור החיוב"><template v-else>{{ charge.description }}</template></td>
                <td><input v-if="chargesEditing" v-model="charge.amount" type="number" min="0" step="any" placeholder="טרם נקבע" aria-label="סכום החיוב כולל מע״מ"><template v-else>{{ chargeAmountKnown(charge) ? money(charge.amount) : 'טרם נקבע' }}</template>
                  <v-btn v-if="chargesEditing" icon x-small :aria-label="'מחיקת חיוב ' + (index + 1)" @click="draftCharges.splice(index, 1)"><v-icon small>mdi-delete</v-icon></v-btn>
                </td>
              </tr>
              <tr v-if="!draftCharges.length"><td colspan="3">אין חיובים נוספים</td></tr>
            </tbody>
            <tfoot><tr><th colspan="2">סה״כ חיובים שנקבעו</th><td>{{ money(chargeTotals.amount) }}</td></tr></tfoot>
          </table>
          <div v-if="chargesEditing" data-html2canvas-ignore="true" class="payment-edit-actions">
            <v-btn small text @click="addCharge">הוספת חיוב</v-btn>
            <v-btn small text @click="resetCharges">איפוס לחיובים הרגילים</v-btn>
          </div>
          <v-alert v-if="!validCharges && !exporting" data-html2canvas-ignore="true" type="warning" dense>יש להזין תיאור וסכומים תקינים שאינם שליליים. ניתן להשאיר את סכום החיוב ריק אם טרם נקבע.</v-alert>
          <p class="statement-note">סכומים שטרם נקבעו אינם כלולים בסיכום. האגרות והחיובים כפופים לסכומים החלים לפי החוזה.</p>
          <footer class="statement-footer">
            <table class="statement-summary statement-final">
              <colgroup><col style="width: 72%"><col style="width: 28%"></colgroup>
              <tbody>
                <tr><th>יתרה עבור הדירה, כולל הפרש מע״מ ככל שחל</th><td>{{ money(balanceIncludingVat) }}</td></tr>
                <tr><th>יתרה בגין חיובים נוספים שנקבעו</th><td>{{ money(chargeTotals.balance) }}</td></tr>
                <tr class="emphasis"><th>{{ totalBalance < 0 ? 'סה״כ יתרת זכות' : 'סה״כ יתרה לתשלום' }}</th><td>{{ money(Math.abs(totalBalance)) }}</td></tr>
              </tbody>
            </table>
            <p class="statement-note">לתשומת לבכם: כל איחור בתשלום יגרום לביטול ההנחה בגין הצמדה למדד.</p>
            <p class="statement-note">הדוח כולל את רכישת הדירה והחיובים הנוספים המפורטים לעיל. חיובים ותשלומים בגין שינויי דיירים אינם נכללים.</p>
            <p class="statement-note">כל הסכומים בש״ח וכוללים מע״מ, ומוצגים בעיגול לשקל שלם.</p>
          </footer>
        </div>
        <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-btn text :disabled="exporting" @click="visible = false">סגירה</v-btn>
        <v-spacer />
        <v-btn color="primary" :disabled="!available || !validSummary || !validPayments || !validCharges" :loading="exporting" @click="download">הורדה כ־PDF</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment';
import { generatePdfFromElement } from './shared/pdf';

export default {
  data: () => ({ visible: false, holder: {}, statementDate: '', fileDate: '', exporting: false, error: '', editing: false, draftPayments: [], nextPaymentKey: 0, editingCharges: false, draftCharges: [], nextChargeKey: 0, editingSummary: false, indexDraft: { base: 134, current: 144.25, discount: 100 }, summaryDraft: { signPrice: '', paidThrough2024: null, paidFrom2025: null, paid: null, vatGap: null } }),
  watch: {
    draftPayments: {
      deep: true,
      handler() {
        this.summaryDraft.paidThrough2024 = null;
        this.summaryDraft.paidFrom2025 = null;
        this.summaryDraft.paid = null;
        this.summaryDraft.vatGap = null;
      },
    },
  },
  computed: {
    validIndexDraft() {
      const d = this.indexDraft;
      return ['base', 'current', 'discount'].every(key => String(d[key]).trim() !== '' && Number.isFinite(Number(d[key])))
        && Number(d.base) > 0 && Number(d.current) > 0 && Number(d.discount) >= 0 && Number(d.discount) <= 100
        && Number.isFinite(Math.max(0, this.balanceBeforeIndexation) * (Number(d.current) / Number(d.base) - 1));
    },
    indexCalculation() {
      if (!this.validIndexDraft) return { indexedPrincipal: 0, percent: 0, beforeDiscount: 0, discountAmount: 0, amount: 0 };
      const d = this.indexDraft;
      const percent = (Number(d.current) / Number(d.base) - 1) * 100;
      const indexedPrincipal = Math.max(0, this.balanceBeforeIndexation) * 0.5;
      const raw = indexedPrincipal * percent / 100;
      const beforeDiscount = Math.max(0, raw);
      const discountAmount = beforeDiscount * Number(d.discount) / 100;
      return { indexedPrincipal, percent, beforeDiscount, discountAmount, amount: Math.round((beforeDiscount - discountAmount) * 100) / 100 };
    },
    summaryEditing() { return this.editingSummary && !this.exporting; },
    summaryPrice() { return Number(this.summaryDraft.signPrice); },
    validSummary() {
      return this.validIndexDraft
        && Object.values(this.summaryDraft).every(value => value === null
        || (String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0));
    },
    summaryTotals() {
      const paidThrough2024 = this.summaryDraft.paidThrough2024 === null ? this.paymentTotals.paidThrough2024 : Number(this.summaryDraft.paidThrough2024);
      const paidFrom2025 = this.summaryDraft.paidFrom2025 === null ? this.paymentTotals.paidFrom2025 : Number(this.summaryDraft.paidFrom2025);
      const paid = this.needsVatCalculation ? paidThrough2024 + paidFrom2025
        : this.summaryDraft.paid === null ? this.paymentTotals.paid : Number(this.summaryDraft.paid);
      const vatGap = this.needsVatCalculation ? this.summaryDraft.vatGap === null
        ? Math.round(Math.max(0, this.summaryPrice - paidThrough2024) / 1.17 * 0.01) : Number(this.summaryDraft.vatGap) : 0;
      return { paidThrough2024, paidFrom2025, paid, vatGap };
    },
    chargesEditing() {
      return this.editingCharges && !this.exporting;
    },
    validCharges() {
      return this.draftCharges.every(charge => String(charge.description || '').trim()
        && (!this.chargeAmountKnown(charge)
          || (Number.isFinite(Number(charge.amount)) && Number(charge.amount) >= 0)));
    },
    chargeTotals() {
      return this.draftCharges.filter(this.chargeAmountKnown).reduce((totals, charge) => {
        totals.amount += Number(charge.amount) || 0;
        totals.balance = totals.amount;
        return totals;
      }, { amount: 0, balance: 0 });
    },
    totalBalance() {
      return this.balanceIncludingVat + this.chargeTotals.balance;
    },
    paymentEditing() {
      return this.editing && !this.exporting;
    },
    needsVatCalculation() {
      return Boolean(this.holder.signDate) && moment(this.holder.signDate).isValid()
        && moment(this.holder.signDate).isBefore('2025-01-01', 'day');
    },
    balanceBeforeIndexation() {
      return this.summaryPrice - this.summaryTotals.paid + this.summaryTotals.vatGap;
    },
    balanceIncludingVat() {
      return this.balanceBeforeIndexation + this.indexCalculation.amount;
    },
    validPayments() {
      return this.draftPayments.every(entry => moment(entry.asmchta_date, 'YYYY-MM-DD', true).isValid()
        && Number.isFinite(Number(entry.schum_hova)) && Number(entry.schum_hova) > 0);
    },
    paymentTotals() {
      const paid = this.draftPayments.reduce((sum, entry) => sum + (Number(entry.schum_hova) || 0), 0);
      const paidThrough2024 = this.draftPayments.reduce((sum, entry) => sum + (
        moment(entry.asmchta_date, 'YYYY-MM-DD', true).isValid() && moment(entry.asmchta_date).isBefore('2025-01-01', 'day')
          ? (Number(entry.schum_hova) || 0) : 0), 0);
      const vatGap = this.needsVatCalculation
        ? Math.round(Math.max(0, Number(this.holder.signPrice) - paidThrough2024) / 1.17 * 0.01) : 0;
      return { paid, paidThrough2024, paidFrom2025: paid - paidThrough2024, vatGap };
    },
    available() {
      return this.holder.remainingBalance != null && this.holder.paid != null;
    },
    payments() {
      return this.draftPayments.slice().sort((a, b) => new Date(a.asmchta_date) - new Date(b.asmchta_date));
    },
  },
  methods: {
    open(holder) {
      this.holder = holder;
      this.resetSummary();
      this.editingSummary = false;
      this.resetPayments();
      this.resetCharges();
      this.editing = false;
      this.editingCharges = false;
      this.statementDate = moment().format('DD/MM/YYYY');
      this.fileDate = moment().format('YYYY-MM-DD');
      this.error = '';
      this.visible = true;
    },
    resetSummary() {
      this.indexDraft = { base: 134, current: 144.25, discount: 100 };
      this.summaryDraft = { signPrice: this.holder.signPrice, paidThrough2024: null, paidFrom2025: null, paid: null, vatGap: null };
    },
    chargeAmountKnown(charge) {
      return charge.amount !== '' && charge.amount !== null && charge.amount !== undefined;
    },
    resetCharges() {
      this.draftCharges = [
        { clause: '2.7.3.1', description: 'פיקדונות וחיבורי מים, גז וחשמל בדירה', amount: '' },
        { clause: '2.7.3.2', description: 'אגרות רישום מקרקעין ומשכנתא', amount: 500 },
        { clause: '2.7.3.3', description: 'חלק יחסי במונים ובחיבורי הרכוש המשותף', amount: 4130 },
        { clause: '2.7.3.4', description: 'רישום הבית המשותף וזכויות הדירה, לרבות תשריטים ומסמכים', amount: 4130 },
      ].map(charge => ({ ...charge, key: this.nextChargeKey++ }));
    },
    addCharge() {
      this.draftCharges.push({ key: this.nextChargeKey++, clause: '', description: '', amount: '' });
    },
    resetPayments() {
      this.draftPayments = (this.holder.bookEntries || []).filter(entry => entry.paymentCategory === 'Paid')
        .map(entry => ({
          statementKey: this.nextPaymentKey++,
          asmchta_date: entry.asmchta_date && moment(entry.asmchta_date).isValid() ? moment(entry.asmchta_date).format('YYYY-MM-DD') : '',
          asmacta1: entry.asmacta1 == null ? '' : String(entry.asmacta1),
          pratim: entry.pratim || '',
          schum_hova: entry.schum_hova,
        }));
    },
    addPayment() {
      this.draftPayments.push({ statementKey: this.nextPaymentKey++, asmchta_date: moment().format('YYYY-MM-DD'), asmacta1: '', pratim: '', schum_hova: '' });
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
      if (!this.available || !this.validSummary || !this.validPayments || !this.validCharges || this.exporting) return;
      this.exporting = true;
      this.error = '';
      try {
        await this.$nextTick();
        await document.fonts.ready;
        await Promise.all(Array.from(this.$refs.statement.querySelectorAll('img')).map(image => image.decode()));
        await generatePdfFromElement(this.$refs.statement, `דירה ${this.holder.flatId} - מצב חשבון ${this.fileDate}.pdf`);
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
.statement-summary .index-input { width: 90px; margin: 4px; display: inline-block; }
.payment-heading { display: flex; align-items: center; gap: 8px; margin: 24px 0 10px; }
.payment-heading h2 { margin: 0 !important; }
.payment-edit-actions { margin-top: 8px; }
.payment-edit-actions p { font-size: 12px; margin: 4px 0; }
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
