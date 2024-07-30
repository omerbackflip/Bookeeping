import axios from "axios";
const baseUrl = process.env.VUE_APP_API_URL;
class SpecificServiceEndPoints {
 
  async saveInvoicesBulk(bulk) {
    var formData = new FormData(); // FormData is being used because need to transfer file to server
    formData.append("file", bulk);
    return await axios.post(`${baseUrl}/specific/save-invoices-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async saveBooksBulk(bulk,company,year) {
    var formData = new FormData(); // FormData is being used because need to transfer file to server
    formData.append("file", bulk);
    formData.append("company", company);
    formData.append("year", year);
    return await axios.post(`${baseUrl}/specific/save-books-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async saveRevenuesBulk(bulk) {
    var formData = new FormData(); // FormData is being used because need to transfer file to server
    formData.append("file", bulk);
    return await axios.post(`${baseUrl}/specific/save-revenues-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async batchBookInvoice() {
    return await axios.post(`${baseUrl}/specific/batch-book-invoice`);
  }

  async batchInvoiceBook() {
    return await axios.post(`${baseUrl}/specific/batch-invoice-book`);
  }

  async batchClearExcelRecID(year) {
    return await axios.post(`${baseUrl}/specific/batch-clear-ExcelRecID`, {'year':year});
  }

  // looks like this is not in used.. !
  // async addPaymentsToInvoice(invoiceId,paymentList) {
	// 	return await axios.put(`${baseUrl}/specific/add-payments-to-invoice/${invoiceId}`, paymentList);
	// }

  async updatePaymentInInvoice(objIdOfPayment,payment) {
		return await axios.put(`${baseUrl}/specific/update-payment-in-invoice/${objIdOfPayment}`, payment);
	}

  async getDbInfo() {
		return await axios.get(`${baseUrl}/specific/get-database-info`);
	}

  async uploadToGDrive() {
    return await axios.post(`${baseUrl}/specific/upload-invoices-to-gdrive`);
  }

  async getGoogleConnectionStatus(){
    return await axios.get(`${baseUrl}/specific/get-google-connection-status`);
  }
}

export default new SpecificServiceEndPoints();