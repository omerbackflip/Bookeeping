export const BOOKS_MODEL = 'books';
export const INVOICE_MODEL = 'invoices';
export const TABLE_MODEL = 'tables';
export const REVENUE_MODEL = 'revenues';
export const VAT_PERCENTAGE = 17;

export const INVOICE_MOBILE_HEADERS = [
    // { text: "G",            value: "group",         class: "hdr-styles",  groupable: false, align: "right"},	
    { text: "Date",         value: "date",          class: "mobile-headers",  groupable: false},	
    { text: "Description",  value: "description",   class: "mobile-headers",  groupable: false,   align: "right"},
    { text: "Amount",       value: "amount",        class: "mobile-headers",  groupable: false,   align: "right", width: "4%"},
    // { text: "Act.",         value: "actions",           class: " mobile-headers",                   groupable: false}
];

export const SUMMARY_PROJECT_WEB_HEADERS = [
    { text: "תשלומים", value: "count", class: "hdr-styles", align: "right" },
    { text: "רווחיות", value: "profit", class: "hdr-styles", align: "right" },
    { text: "הפרשים", value: "balance", class: "hdr-styles", align: "right" },
    { text: "הכנסות", value: "revenue", class: "hdr-styles", align: "right" },
    { text: "הוצאות", value: "total", class: "hdr-styles", align: "right" },
    { text: "פרויקט", value: "project", class: "hdr-styles", align: "right" },
];

export const SUMMARY_PROJECT_MOBILE_HEADERS = [
    { text: "הכנסות", value: "revenue", class: "hdr-styles", align: "right" },
    { text: "הוצאות", value: "total", class: "hdr-styles", align: "right" },
    { text: "פרויקט", value: "project", class: "hdr-styles", align: "right" },
];

export const SUMMARY_SUPPLIER_HEADERS = [
    // { text: "הוצאות כולל", value: "totalInclude", class: "hdr-styles", align: "right" },
    { text: "הוצאות ללא", value: "totalExclude", class: "hdr-styles", align: "right" },
    { text: "תקציב", value: "budget", class: "hdr-styles", align: "right" },
    { text: "שם ספק", value: "supplier", class: "hdr-styles", align: "right" },
];

export const INVOICE_WEB_HEADERS = [
    { text: "G",            value: "group",         class: 'hdr-styles',},
    { text: "Comp.",        value: "company",       class: 'hdr-styles',                                   width: "4%"},	
    { text: "Project",      value: "project",       class: 'hdr-styles',},
    { text: "Date",         value: "date",          class: 'hdr-styles',groupable: false},	
    { text: "Description",  value: "description",   class: 'hdr-styles',groupable: false,   align: "right", width: "20%"},
    { text: "Supplier",     value: "supplier",      class: 'hdr-styles',                    align: "right"},	
    { text: "Amount",       value: "amount",        class: 'hdr-styles',groupable: false,   align: "right"},
    { text: "Vat",          value: "vat",           class: 'hdr-styles',groupable: false,   align: "right"},
    { text: "Total",        value: "total",         class: 'hdr-styles',groupable: false,   align: "right"},
    { text: "Invoice ID",   value: "invoiceId",     class: 'hdr-styles',groupable: false,   align: "right"},
    { text: "Excel Rec ID", value: "excelRecID",    class: 'hdr-styles',groupable: false,                   width: "4%"},
    { text: "Payments",     value: "payments[0].payment",   class: 'hdr-styles',        groupable: false,   align: "right"},
    { text: "Remark",       value: "remark",        class: 'hdr-styles',    groupable: false,   align: "right", width: "30%"},
    // { text: "Act.",         value: "actions",       groupable: false,   },
    { text: "P",            value: "published",     class: 'hdr-styles',    groupable: false}
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
        date: new Date(),
        supplier: "",
        invoiceId: "",
        remark: "",
        excelRecID: null,
        year: null,
        payments: [],
        link: "Here Link",
};

export const navItems = [
    {icon: 'home', text: 'Invoice List', route: '/'},
    {icon: 'dashboard', text: 'Book List', route: '/bookingList/' },
    {icon: 'event', text: 'Table List', route: '/tableList'},
    {icon: 'folder', text: 'Import INVOICEs', route: null, import: 'INVOICES', onClick: 'runModal'},
    {icon: 'folder', text: 'Import Bella BOOKs', route: null, import: 'BOOKS', onClick: 'runModal'},
    {icon: 'folder', text: 'Import REVENUEs', route: null, import: 'REVENUES', onClick: 'runModal'},
    {icon: 'widgets', text: 'Synergy List', route: '/synergyList'},
    {icon: 'widgets', text: 'Project Summary', route: '/ProjectSummary'},
    {icon: 'widgets', text: 'Supplier Summary', route: '/SupplierSummary'},
    {icon: 'widgets', text: 'Revenues', route: '/RevenueList'},
    {icon: 'widgets', text: 'Forcast Payments', route: '/ForecastPayment'},
]

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}