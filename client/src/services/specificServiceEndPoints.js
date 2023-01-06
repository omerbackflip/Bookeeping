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

  async batchBookInvoice() {
    return await axios.post(`${baseUrl}/specific/batch-book-invoice`);
  }

  async batchInvoiceBook() {
    return await axios.post(`${baseUrl}/specific/batch-invoice-book`);
  }

  async batchClearExcelRecID(year) {
    return await axios.post(`${baseUrl}/specific/batch-clear-ExcelRecID`, {'year':year});
  }
}

export default new SpecificServiceEndPoints();