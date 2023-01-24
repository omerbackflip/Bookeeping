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