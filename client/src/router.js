import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      alias: "/invoices/:selectedYear",
      name: "invoicesList",
      component: () => import("./components/InvoicesList")
    },
    {
      path: "/bookingList",
      name: "bookingList",
      component: () => import("./components/BookingList")
    },
    {
      path: "/synergyList",
      name: "synergyList",
      component: () => import("./components/SynergyList")
    },
    {
      path: "/tableList",
      name: "tableList",
      component: () => import("./components/TableList")
    },
    {
      path: "/holdersList",
      name: "holderList",
      component: () => import("./components/HoldersList")
    },
    {
      path: "/projectsummary",
      name: "project-summary",
      component: () => import("./components/ProjectSummary")
    },
    {
    path: "/suppliersummary",
    name: "supplier-summary",
    component: () => import("./components/SupplierSummary")
    },
    {
      path: "/revenueList",
      name: "revenueList",
      component: () => import("./components/RevenueList")
    },
    {
      path: "/forecastPayment",
      name: "forecastPayment",
      component: () => import("./components/ForecastPayment")
    },
    {
      path: "/googleDrive",
      // alias: "/googleDrive",
      component: () => import("./components/GoogleDrive")
    },
  ]
});