import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "hash",
  routes: [
    {
      path: "/",
      alias: "/invoices/:selectedYear",
      name: "invoices-list",
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
      path: "/summary",
      name: "summary",
      component: () => import("./components/Summary")
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
  ]
});