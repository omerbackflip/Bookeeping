export const BOOKS_MODEL = 'books';
export const INVOICE_MODEL = 'invoices';
export const TABLE_MODEL = 'tables';

export const INVOICE_MOBILE_HEADERS = [{
    text: "G",
    value: "data-table-expand",
    class: " mobile-headers expantion-button",
    groupable: false,
},	
{
    text: "Date",
    value: "date",
    class: " mobile-headers",
    groupable: false,
},	
{
    text: "Description",
    value: "description",
    class: " mobile-headers",
    groupable: false,
    align: "right",
},
{
    text: "Amount",
    value: "amount",
    class: " mobile-headers",
    groupable: false,
    align: "right",
},
{
    text: "Act.",
    value: "actions",
    sortable: false,
    class: " mobile-headers",
    groupable: false,
}];

export const INVOICE_WEB_HEADERS = [{
    text: "^",
    value: "data-table-expand",
    class: "",
    groupable: false,
},	
{ text: "G", value: "group", class: "" },
{
    text: "Comp.",
    value: "company",
    class: "",
    width: "4%",
},	
{ text: "Project", value: "project", class: "" },
{
    text: "Date",
    value: "date",
    class: "",
    groupable: false,
},	
{
    text: "Description",
    value: "description",
    class: "",
    groupable: false,
    width: "20%",
    align: "right",
},
{
    text: "Supplier",
    value: "supplier",
    class: "",
    align: "right",
},	
{
    text: "Amount",
    value: "amount",
    class: "",
    groupable: false,
    align: "right",
},
{
    text: "Vat",
    value: "vat",
    class: "",
    groupable: false,
    align: "right",
},
{
    text: "Total",
    value: "total",
    class: "",
    groupable: false,
    align: "right",
},
{
    text: "Invoice ID",
    value: "invoiceId",
    class: "",
    groupable: false,
    align: "right",
},
{
    text: "Excel Rec ID",
    value: "excelRecID",
    class: "",
    groupable: false,
    width: "4%",
},
{
    text: "Remark",
    value: "remark",
    class: "",
    groupable: false,
    width: "20%",
    align: "right",
},
{
    text: "Act.",
    value: "actions",
    sortable: false,
    class: "",
    groupable: false,
},
{
    text: "P",
    value: "published",
    class: "",
    groupable: false,
}];