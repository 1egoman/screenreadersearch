"use strict";
const algorithm = require("./algorithmEnter"),
      request = require("request-promise"),

      express = require("express"),
      app = express();

let query = "google search";

request({
  method: "GET",
  url: "http://google.com",
}).then(data => {
  return algorithm(data, query)
})
.then(a => console.log(a))
.catch(e => e.stack ? console.error(e.stack) : console.error(e));
