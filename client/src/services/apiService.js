import http from "../http-common";

class ApiService {
  get(params) {
    return http.get("generic/get-list",{params});
  }

  getById(id,params) {
    return http.get(`generic/get-by-id/${id}`,{params});
  }

  create(data,params) {
    return http.post("generic/create", data, {params});
  }

  update(id, data,params) {
    return http.put(`generic/update/${id}`, data, {params});
  }

  deleteOne(params) {
    return http.delete(`generic/delete`,{params});
  }

  deleteAll(params) {
    return http.delete(`generic/delete-all`,{params});
  }

}

export default new ApiService();