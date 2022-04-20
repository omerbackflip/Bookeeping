import http from "../http-common";

class TutorialDataService {
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

  findByInvoiceAndUpdate(company, invoiceId, excelRecID){
    return http.put(`/tutorials/update-records`, {
      excelRecID,
      company,
      invoiceId

    })
  }

}

export default new TutorialDataService();