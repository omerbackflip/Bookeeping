import http from "../http-common";
import axios from "axios";
const baseUrl = process.env.VUE_APP_API_URL;
class InvoiceDataService {
  getAll() {
    return http.get("/tutorials");
  }

  get(id) {
    return http.get(`/tutorials/${id}`);
  }

  create(data) {
    return http.post("/tutorials", data);
  }

  update(id, data) {
    return http.put(`/tutorials/${id}`, data);
  }

  delete(id) {
    return http.delete(`/tutorials/${id}`);
  }

  deleteAll() {
    return http.delete(`/tutorials`);
  }

  findByTitle(title) {
    return http.get(`/tutorials?description=${title}`);
  }

  findByYear(year) {
    return http.get(`/tutorials?year=${year}`);
  }

  findByInvoiceAndUpdate(company, year, invoiceId, excelRecID) {
    return http.put(`/tutorials/update-records`, {
      company,
      year,
      invoiceId,
      excelRecID
    })
  }

  async saveBulk(bulk) {
    var formData = new FormData();
    formData.append("file", bulk);
    return await axios.post(`${baseUrl}/tutorials/save-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

}

export default new InvoiceDataService();