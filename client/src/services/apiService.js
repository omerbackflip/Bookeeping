import http from "../http-common";

class ApiService {
  getMany(params) {
    return http.get("generic/get-list",{params});
  }

  getOne(params) {
    return http.get("generic/get-one",{params});
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

  findOneAndUpdate(data, params) {
    return http.put("generic/find-one-and-update", data, {params});
  }

  deleteOne(params) {
    return http.delete(`generic/delete`,{params});
  }

  deleteAll(params) {
    return http.delete(`generic/delete-all`,{params});
  }

}

export default new ApiService();