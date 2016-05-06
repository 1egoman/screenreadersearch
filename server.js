"use strict";
const phantom = require('phantom'),
      cheerio = require('cheerio'),
      Promise = require('bluebird');

// do a search with the page in mind
let sitepage = null, phInstance = null;
phantom.create().then(instance => {
  phInstance = instance;
  return instance.createPage();
}).then(page => {
  sitepage = page;
  return page.open('https://twitter.com');
}).then((data) => {
  return sitepage.evaluate(function() {
    nodes = document.querySelectorAll("[aria-labelledby]");
    total = Array.prototype.slice.call(nodes).map(function(i) {
      label = document.getElementById(i.attributes["aria-labelledby"].nodeValue);
      return {
        node: i,
        nodeText: i.innerText,
        nodeAttr: i.attributes,
        label: label,
        labelText: label.innerText,
      };
    });

    return total;
  });
  // return sitepage.property('content');
}).then(content => {
  console.log("OUT", content);
  // let label = new PageLabels(content);
  // label.parse();
  // console.log(label.labels);

  sitepage.close();
  phInstance.exit();
}).catch(error => {
  console.error(error);
  phInstance.exit();
});


