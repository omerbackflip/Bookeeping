export const BOOKS_MODEL = 'books';
export const INVOICE_MODEL = 'invoices';
export const TABLE_MODEL = 'tables';
export const REVENUE_MODEL = 'revenues';
export const HOLDER_MODEL = 'holders';
export const VAT_PERCENTAGE = 17;
import apiService from "../services/apiService";

export const INVOICE_MOBILE_HEADERS = [
    // { text: "G",            value: "group",         class: "hdr-styles",  groupable: false, align: "right"},	
    { text: "Supplier",         value: "supplier",          class: "mobile-headers",  groupable: false, width: "30%"},	
    { text: "Description",  value: "description",   class: "mobile-headers",  groupable: false,   align: "right", width: "60%"},
    { text: "Amount",       value: "amount",        class: "mobile-headers",  groupable: false,   align: "right", width: "10%"},
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
    { text: "Description",  value: "description",   class: 'hdr-styles',groupable: false,   align: "right", width: "15%"},
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
        GDFileId: null,
        GDFileName: null,
};

export const HOLDER_HEADERS = [
    { text: "FlatID",       value: "flatId",        class: "hdr-styles",        groupable: false},	
    { text: "holderName",   value: "holderName",    class: "mobile-headers",    groupable: false},	
    { text: "phone",        value: "phone",         class: "mobile-headers",    groupable: false},
    { text: "signDate",     value: "signDate",      class: "mobile-headers",    groupable: false},
    { text: "signPrice",    value: "signPrice",     class: " mobile-headers",   groupable: false},
    { text: "remark",       value: "remark",        class: " mobile-headers",   groupable: false},
    { text: "email",        value: "email",         class: " mobile-headers",   groupable: false,   align: "left"},
];

export const navItems = [
    {icon: 'home', text: 'Invoice List', route: '/'},
    {icon: 'dashboard', text: 'Book List', route: '/bookingList/' },
    {icon: 'event', text: 'Table List', route: '/tableList'},
    {icon: 'event', text: 'Holder List', route: '/HoldersList'},
    {icon: 'folder', text: 'Import INVOICEs', route: null, import: 'INVOICES', onClick: 'runModal'},
    {icon: 'folder', text: 'Import Bella BOOKs', route: null, import: 'BOOKS', onClick: 'runModal'},
    {icon: 'folder', text: 'Import REVENUEs', route: null, import: 'REVENUES', onClick: 'runModal'},
    {icon: 'widgets', text: 'Synergy List', route: '/synergyList'},
    {icon: 'widgets', text: 'Project Summary', route: '/ProjectSummary'},
    {icon: 'widgets', text: 'Supplier Summary', route: '/SupplierSummary'},
    {icon: 'widgets', text: 'Revenues', route: '/RevenueList'},
    {icon: 'widgets', text: 'Forcast Payments', route: '/ForecastPayment'},
    {icon: 'widgets', text: 'Google Drive', route: '/googleDrive'},
];

export const isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
};

export const loadTable = async (table_id) => {
    try {
        const response = await apiService.getMany({ table_id, model: TABLE_MODEL });
        if (response.data.length > 0) {
            return (response.data)
            // return (response.data.map((code) => code.description))
        } else return (window.alert("Read Table no - " + table_id + " faild"))
    } catch (error) {
        console.log(error);
    }
};