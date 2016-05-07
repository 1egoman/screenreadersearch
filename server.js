"use strict";
let layout = `
<div role="button" aria-label="My Button Label" class="btn btn-primary">
  <i class="fa fa-user" />
  My Button Text
</div>
<div role="checkbox" aria-label="my label"></div>
`;

let $ = require("cheerio").load(layout);
let labels = [];

// recursively crawl the dom tree to find the textual content of a node
function getNodeContents(node) {
  if (node.children) {
    return node.children.reduce((total, child) => {
      // recurse through all subnodes and put them into the tree
      let data = getNodeContents(child);
      if (Array.isArray(data)) {
        return [...total, ...data];
      } else {
        return [...total, data];
      }
    }, []);
  } else {
    return node.data;
  }
}

// return the label for a node
function getNodeDescriptor(node) {
  let nodeContent = getNodeContents(node).join(" ").trim();

  // a normal label
  if (node.attribs["aria-label"]) {
    return {
      label: node.attribs["aria-label"], // the label itself
      nodeContent,
    };

  // a label that references another element
  } else if (node.attribs["aria-labelled"]) {
    let labelId = node.attribs["aria-labelledby"];
    let labelledNode = $(`#${labelId}`).toArray();
    if (labelledNode.length > 0) {
      return {
        type: "aria-labelledby",
        nodeContent,
        label: getNodeContents(labelledNode[0])
               .join(" ")
               .trim(),
        labelRef: node.attribs["aria-labelledby"], // the id of the element that contains
                                                // this element's label
      };
    } else {
      return {
        error: "NO_SUCH_LABEL_ID",
        id: labelId,
        nodeContent,
      };
    }
  } else {
    return {nodeContent, label: null};
  }
}

// find all labels
let data = $("[role]").toArray().map(node => {
  // get the text associated with a node
  let content = getNodeDescriptor(node);

  // return each node's data
  return {
    role: node.attribs.role,
    label: (function(content) {
      return content.label ||
             content.nodeContent;
    })(content),
  }
});

console.log(data)
/*
 * Buttons: Click them to see what happens
 *
 */
