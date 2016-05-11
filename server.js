"use strict";
const algorithm = require("./algorithmEnter"),
      request = require("request-promise"),

      express = require("express"),
      app = express();

// ejs templates
app.set('view engine', 'ejs');

app.get("/search", (req, res) => {
  request({
    method: "GET",
    url: req.query.site,
  }).then(data => {
    return algorithm(data, req.query.q)
  })
  .then(actions => {
    res.render("search", {data: {
      query: req.query.q,
      domain: req.query.site,
      actions,
    }});
  })
  .catch(e => e.stack ? res.send(e.stack) : res.send(e));
});

app.listen(process.env.PORT || 8000);
