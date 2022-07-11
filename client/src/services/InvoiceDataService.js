import http from "../http-common";
import axios from "axios";
const baseUrl = process.env.VUE_APP_API_URL;
class InvoiceDataService {
  getAll() {
    return http.get("/invoices");
  }

  get(id) {
    return http.get(`/invoices/${id}`);
  }

  create(data) {
    return http.post("/invoices", data);
  }

  update(id, data) {
    return http.put(`/invoices/${id}`, data);
  }

  delete(id) {
    return http.delete(`/invoices/${id}`);
  }

  deleteAll() {
    return http.delete(`/invoices`);
  }

  findByTitle(title) {
    return http.get(`/invoices?description=${title}`);
  }

  findByYear(year) {
    return http.get(`/invoices?year=${year}`);
  }

  findByInvoiceAndUpdate(company, year, invoiceId, excelRecID) {
    return http.put(`/invoices/update-records`, {
      company,
      year,
      invoiceId,
      excelRecID
    })
  }

  async saveBulk(bulk) {
    var formData = new FormData();
    formData.append("file", bulk);
    return await axios.post(`${baseUrl}/invoices/save-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

}

export default new InvoiceDataService();