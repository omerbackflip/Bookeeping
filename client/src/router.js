import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      alias: "/invoices",
      name: "invoices",
      component: () => import("./components/InvoicesList")
    },
    {
      path: "/invoices/:id",
      name: "invoice-details",
      component: () => import("./components/Invoice")
    },
    {
      path: "/add",
      name: "add",
      component: () => import("./components/AddInvoice")
    },
    {
      path: "/loadCsv",
      name: "loadCsv",
      component: () => import("./components/VueCsvImport")
    },
    {
      path: "/addInv",
      name: "addInv",
      component: () => import("./components/AddInvoice")
    },
    {
      path: "/loadBookCsv",
      name: "loadBookCsv",
      component: () => import("./components/ImportCsvBook")
    },
    {
      path: "/bookingList",
      name: "bookingList",
      component: () => import("./components/BookingList")
    },
    {
      path: "/tableList",
      name: "tableList",
      component: () => import("./components/TableList")
    },
  ]
});