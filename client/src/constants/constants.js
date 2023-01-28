export const BOOKS_MODEL = 'books';
export const INVOICE_MODEL = 'invoices';
export const TABLE_MODEL = 'tables';

export const INVOICE_MOBILE_HEADERS = [
    { text: "G",            value: "data-table-expand", class: " mobile-headers expantion-button",  groupable: false},	
    { text: "Date",         value: "date",              class: " mobile-headers",                   groupable: false},	
    { text: "Description",  value: "description",       class: " mobile-headers",                   groupable: false,   align: "right"},
    { text: "Amount",       value: "amount",            class: " mobile-headers",                   groupable: false,   align: "right"},
    // { text: "Act.",         value: "actions",           class: " mobile-headers",                   groupable: false}
];

export const INVOICE_WEB_HEADERS = [
    { text: "G",            value: "group",          },
    { text: "Comp.",        value: "company",                                           width: "4%"},	
    { text: "Project",      value: "project",        },
    { text: "Date",         value: "date",          groupable: false},	
    { text: "Description",  value: "description",   groupable: false,   align: "right", width: "20%"},
    { text: "Supplier",     value: "supplier",                          align: "right"},	
    { text: "Amount",       value: "amount",        groupable: false,   align: "right"},
    { text: "Vat",          value: "vat",           groupable: false,   align: "right"},
    { text: "Total",        value: "total",         groupable: false,   align: "right"},
    { text: "Invoice ID",   value: "invoiceId",     groupable: false,   align: "right"},
    { text: "Excel Rec ID", value: "excelRecID",    groupable: false,                   width: "4%"},
    { text: "Payments",     value: "payments.payment",        groupable: false,   align: "right"},
    { text: "Remark",       value: "remark",        groupable: false,   align: "right", width: "30%"},
    // { text: "Act.",         value: "actions",       groupable: false,   },
    { text: "P",            value: "published",     groupable: false}
];

export const NEW_INVOICE = {
        id: null,
        company: "",
        project: "",
        description: "",
        published: false,
        amount: null,
        vat: null,
        total: null,
        group: "",
        date: null,
        supplier: "",
        invoiceId: "",
        remark: "",
        excelRecID: null,
        year: null,
        payments: [],
};

export const navItems = [
    {icon: 'home', text: 'Invoice List', route: '/'},
    {icon: 'dashboard', text: 'Book List', route: '/bookingList'},
    {icon: 'event', text: 'Table List', route: '/tableList'},
    {icon: 'folder', text: 'Import INVOICEs', route: null , onClick: 'toggleModal'},
    {icon: 'gavel', text: 'Import BOOKs', route: null , onClick: 'toggleBook'},
    {icon: 'widgets', text: 'Synergy List', route: '/synergyList'},
]