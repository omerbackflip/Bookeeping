import http from "../http-common";

class TableDataService {
  getAll() {
    return http.get("/tables");
  }

  get(id) {
    return http.get(`/tables/${id}`);
  }

  create(data) {
    return http.post("/tables", data);
  }

  update(id, data) {
    return http.put(`/tables/${id}`, data);
  }

  delete(id) {
    return http.delete(`/tables/${id}`);
  }

  deleteAll() {
    return http.delete(`/tables`);
  }

  findByTitle(title) {
    return http.get(`/tables?description=${title}`);
  }
  
  findByTableID(table_id) {
    return http.get(`/tables?table_id=${table_id}`);
  }
}

export default new TableDataService();