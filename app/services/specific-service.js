const moment = require('moment');
const db = require("../models");
const Invoice = db.invoices;

exports.getBooksToSave = (data, company) => {
    try {
        let books = [];
        data.forEach((item) => {
            if (item.asmchta_date) { // weedout the "יתרת פתיחה"
                const { year, asmacta1, record_id } = item;
                if (company && year && asmacta1 != '') { // update excelRecID with inoiceId...
                    let invoiceId = asmacta1;
                    let excelRecID = record_id;
                    Invoice.findOneAndUpdate({company, year, invoiceId},{ excelRecID });
                }
                let book = {
                    company: company,
                    asmchta_date: !isNaN(Date.parse(item['asmchta_date'])) ? moment(item['asmchta_date']).add(1,'days') : new Date(),
                    record_id: item['record_id'],
                    year: item['year'],
                    record_schum: item['record_schum'],
                    pratim: item['pratim'],
                    asmacta1: item['asmacta1'],
                    schum_hova: item['schum_hova'],
                    schum_zchut: item['schum_zchut'],
                    cust_lname: item['cust_lname'],
                    cust_id: item['cust_id'],
                    bs_item_name: item['bs_item_name'],
                    bs_item_id: item['bs_item_id'],
                    bs_group_name: item['bs_group_name'],
                    bs_group_id: item['bs_group_id'],
                }
                books.push(book);
            }
        });
        return books;
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.getInvoicesToSave = (data) => {
    try {
        let invoices = [];
        data.forEach(item => {
        let invoice = {
                company: item.company,
                project: item.project,
                description: item.description,
                published: item.published,
                amount: item.amount,
                vat: item.vat,
                total: item.total,
                group: item.group,
                date: !isNaN(Date.parse(item.date)) ? moment(item.date,"DD MM YYYY") : null,
                supplier: item.supplier,
                invoiceId: item.invoiceId,
                remark: item.remark,
                excelRecID: item.excelRecID,
                year: item.year,
                payments:[],
            };
            if (item.payments){
                const paymentStr = item.payments.split(',');
                for (i=0;i<paymentStr.length/8;i++){
                    let newStr = paymentStr.slice(i*8,i*8+8)
                    let [dd,mm,yyyy] = newStr[3].split('/')
                    invoice.payments[(i)] = {  // order is important !!!
                        checkID: newStr[1],
                        date: moment(newStr[3],"DD MM YYYY").add(1,'days').subtract(1,'hour'), // this manipulation to align the date
                        payment: newStr[5],  
                        redeemed: newStr[7],  
                    }
                }
            }   
            invoices.push(invoice);
        });
        return invoices;
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.getInvoicesToExcelExport = (invoices) => { // used during upload to GDrive
    try{
        let formatedInvoices = [];

        formatedInvoices = invoices.map((invoice) => {
                
            invoice._id = invoice._id.toString();
            // invoice.date = moment(invoice.date).format('DD/MM/YYYY')
            // invoice.date = moment(invoice.date)
            // invoice.date = new Date (invoice.date).toLocaleDateString('en-GB')

            // delete invoice.project;

            if (invoice.payments.length > 0) {
            return ({...invoice, payments:
                invoice.payments.map((payment) => {
                    let redeemed = payment.redeemed ? true : false;
                    return (["checkID",payment.checkID,
                            "date",new Date (payment.date).toLocaleDateString('en-GB'),
                            "payment",payment.payment,
                            "redeemed", redeemed]).toString()}).toString() 
                });
            }else {
                return (invoice)
            }
        });
        return formatedInvoices;

    }catch (error){
        console.log(error)
        throw error;
    }
}