import http from "../http-common";

class ApiService {
  // getMany(params) {
  //   return http.get("generic/get-list",{params});
  // }

  // getOne(params) {
  //   return http.get("generic/get-one",{params});
  // }

  // getById(id,params) {
  //   return http.get(`generic/get-by-id/${id}`,{params});
  // }

  //  Unified entity getter
  //  @param {string} model - model name (e.g. "LEAD_MODEL")
  //  @param {Object} filter - optional filter object (e.g. { flatId: 36 })
  //  @returns {Promise<Object|Array>} Single object or array
  // 
  clientGetEntities(model, filter = {}) {
    return http.get("generic/entity", {params: { model, ...filter }});
  }


  create(data,params) {
    return http.post("generic/create", data, {params});
  }

  // update(id, data,params) {
  //   return http.put(`generic/update/${id}`, data, {params});
  // }

  // findOneAndUpdate(data, params) {
  //   return http.put("generic/find-one-and-update", data, {params});
  // }

  updateEntity(filter, data, params) {
    return http.put("generic/update", { filter, data }, { params });
  }

  deleteOne(params) {
    return http.delete(`generic/delete`,{params});
  }

  deleteAll(params) {
    return http.delete(`generic/delete-all`,{params});
  }

}

export default new ApiService();