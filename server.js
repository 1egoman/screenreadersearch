"use strict";
const algorithm = require("./algorithmEnter");

let query = "create new item";
let pageContents = `
<div role="button" aria-label="unrealted"></div>
<div role="search">
  <div role="textbox" aria-label="item name"></div>
  <div role="button" aria-label="create">
    <i class="fa fa-plus"></i>
  </div>
</div>
`;

algorithm(pageContents, query)
.then(a => console.log(a))
.catch(e => console.error(e));
