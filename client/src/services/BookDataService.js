import http from "../http-common";
import axios from "axios";
const baseUrl = process.env.VUE_APP_API_URL;
class BookDataService {
  getAll() {
    return http.get("/books");
  }

  get(id) {
    return http.get(`/books/${id}`);
  }

  create(data) {
    return http.post("/books", data);
  }

  update(id, data) {
    return http.put(`/books/${id}`, data);
  }

  delete(id) {
    return http.delete(`/books/${id}`);
  }

  deleteAll() {
    return http.delete(`/books`);
  }

  findByTitle(title) {
    return http.get(`/books?description=${title}`);
  }

  findByRecord_id(title) {
    return http.get(`/books?record_id=${title}`);
  }
  
  async saveBulk(bulk,company) {
    var formData = new FormData();
    formData.append("file", bulk);
    formData.append("company", company);
    return await axios.post(`${baseUrl}/books/save-bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

}

export default new BookDataService();