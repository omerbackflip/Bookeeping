import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:3000/api",
  // baseURL: "http://185.28.152.24:3000/api",

  headers: {
    "Content-type": "application/json"
  }
});