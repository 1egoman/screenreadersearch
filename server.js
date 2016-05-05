"use strict";
const phantom = require('phantom'),
      cheerio = require('cheerio'),
      Promise = require('bluebird');

class PageLabels {
  constructor(dom) {
    this.dom = dom;
    this.dollar = cheerio.load(this.dom);
    this.labels = [];
  }

  isLabel(n) {
    return n.indexOf("aria") === 0;
  }

  getLabelContents(name, node) {
    switch (name) {
      case "aria-label": return node.attribs["aria-label"];
      case "aria-labelledby":
        // let val = this.dollar(`#${node.attribs["aria-labelledby"]}`);
        console.log(node)
    }
  }

  // extract labels from nodes
  getLabelFromNode(node, opts) {
    let label = Object.keys(node.attribs).find(this.isLabel);
    if (label) {
      this.labels.push({
        label,
        value: this.getLabelContents(label, node),
        opts,
      });
      this.getLabelFromNode(node.parent, {child: node});
    } else {
      return null;
    }
  }

  parse() {
    let $ = this.dollar;
    return new Promise((resolve, reject) => {
      $("[aria-label], [aria-labelledby]").toArray()
      .forEach((i, ct) => {
        this.getLabelFromNode(i);
      });
    });
  }
}

// do a search with the page in mind
let sitepage = null, phInstance = null;
phantom.create().then(instance => {
  phInstance = instance;
  return instance.createPage();
}).then(page => {
  sitepage = page;
  return page.open('https://twitter.com');
}).then((data) => {
  return sitepage.property('content');
}).then(content => {
  let label = new PageLabels(content);
  label.parse();
  console.log(label.labels);

  sitepage.close();
  phInstance.exit();
}).catch(error => {
  console.error(error);
  phInstance.exit();
});


