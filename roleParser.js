"use strict";
let layout = `
<!-- button -->
<div role="button" aria-label="My Button Label" class="btn btn-primary">
  <i class="fa fa-user" />
  My Button Text
</div>

<!-- checkbox -->
<div role="checkbox" aria-checked="true" aria-label="my check label"></div>

<!-- textbox -->
<div role="textbox" value="data" aria-label="my text label"></div>
<div role="textbox" aria-multiline="true" aria-label="my text multiline label">
  data
  multiline
</div>
`;

// the selectors to try when seaching for components
const selectors = {
  button: [
    ".btn", ".button",
    "[role=button]",
    "button",
    "input[type=submit]", "input[type=button]",
  ],
  checkbox: [
    "[role=checkbox]",
    "input[type=checkbox]",
  ],
  textbox: [
    "[role=textbox]",
    "input[type=text]",
  ],
  progressbar: [
    "[role=progressbar]",
    "input[type=text]",
  ],
};

// Input: a html string
// Output: a list of actionable elements with their relevant labels.
module.exports = function roleParser(layout) {
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

    // fetch the label from either the contents of a node.
    // used with 'aria-labelledby' and friends.
    function getLabelFromContents(node) {
      let nodeReferencedLabel = getNodeContents(node[0]).join(" ").trim();
      if (nodeReferencedLabel.length > 0) {
        return nodeReferencedLabel;
      } else {
        return getLabelFromId(node);
      }
    }

    // try to split the id with punctuation to make a more human readable
    // form.
    function getLabelFromId(node) {
      if (node.attribs.id) {
        return node.attribs["id"]
        .split(/[!#$%&()*+, \-./:;<=>?@ \\\^_`{|}~]/)
        .filter(c => c.trim().length > 0)
        .join(" ");
      } else {
        return null;
      }
    }

    // a normal label
    if (node.attribs["aria-label"]) {
      return {
        label: node.attribs["aria-label"], // the label itself
        nodeContent,
      };

    // a label that references another element
    } else if (node.attribs["aria-labelledby"]) {
      let labelId = node.attribs["aria-labelledby"];
      let labelledNode = $(`#${labelId}`).toArray();
      if (labelledNode.length > 0) {
        return {
          type: "aria-labelledby",
          nodeContent,
          label: getLabelFromContents(labelledNode),
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
      return {nodeContent, label: getLabelFromId(node)}; // as a last resort, look for the label within the id
    }
  }

  // return the active state of a node. ie, is a checkbox checked?
  function getNodeState(node) {
    let attr = node.attribs;

    // for a progressbar
    if (attr["aria-valuenow"]) {
      return {
        value: attr["aria-valuenow"],
        minValue: attr["aria-valuemin"],
        maxValue: attr["aria-valuemax"],
      };
    } else {
      return attr.checked ||
             attr.value ||
             attr["aria-pressed"] ||
             attr["aria-checked"] ||
             attr["aria-selected"];
    }
  }


  // for each role, try and find matches
  let data = [];
  for (let role in selectors) {
    if (selectors.hasOwnProperty(role)) {
      let selector = selectors[role].join(", ");
      let output = $(selector).toArray().map(node => {
        // get the text associated with a node
        let content = getNodeDescriptor(node);

        // return each node's data
        return {
          role, // the input type
          content: content.nodeContent,

          // the text label for the element
          label: content.label || content.nodeContent,

          // the present condition of te element
          state: getNodeState(node),
        };
      });

      data = [...data, ...output];
    }
  }
  return data;
}
