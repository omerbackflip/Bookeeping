import axios from "axios";

export default axios.create({
  baseURL: "http://185.28.152.24:8080/api",
  headers: {
    "Content-type": "application/json"
  }
});