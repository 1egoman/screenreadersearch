"use strict";
const algorithm = require("./algorithmEnter");

let query = "search tweet";
let pageContents = `
<div role="search">
  <form class="t1-form form-search js-search-form" action="/search" id="global-nav-search" _lpchecked="1">
    <label class="visuallyhidden" for="search-query">Search query</label>
    <input class="search-input" type="text" id="search-query" placeholder="Search Twitter" name="q" autocomplete="off" spellcheck="false" aria-autocomplete="list" aria-expanded="false" aria-owns="typeahead-dropdown-1">
    <span class="search-icon js-search-action">
      <button type="submit" class="Icon Icon--search nav-search" tabindex="-1">
        <span class="visuallyhidden">Search Twitter</span>
      </button>
    </span>
      <div role="listbox" class="dropdown-menu typeahead" id="typeahead-dropdown-1" style="display: none;">
  <div aria-hidden="true" class="dropdown-caret">
    <div class="caret-outer"></div>
    <div class="caret-inner"></div>
  </div>
  <div role="presentation" class="dropdown-inner js-typeahead-results"><div role="presentation" class="typeahead-recent-searches block0 has-items">
  <h3 id="recent-searches-heading" class="typeahead-category-title recent-searches-title">Recent searches</h3><button type="button" tabindex="-1" class="btn-link clear-recent-searches">Clear All</button>
  <ul role="presentation" class="typeahead-items recent-searches-list"><li role="presentation" class="typeahead-item typeahead-recent-search-item">
      <span class="Icon Icon--close" aria-hidden="true"><span class="visuallyhidden">Remove</span></span>
      <a role="option" aria-describedby="recent-searches-heading" class="js-nav" href="/search?src=typd&amp;q=one%20million%20cups%20syracuse" data-search-query="one million cups syracuse" data-query-source="typed_query" data-ds="recent_search" tabindex="-1" id="typeahead-item-0"><span>one million cups syracuse</span></a>
    </li></ul>
</div><div role="presentation" class="typeahead-saved-searches block1">
  <h3 id="saved-searches-heading" class="typeahead-category-title saved-searches-title" style="display: none;">Saved searches</h3>
  <ul role="presentation" class="typeahead-items saved-searches-list"></ul>
</div><ul role="presentation" class="typeahead-items typeahead-topics block2" style="display: none;"></ul><ul role="presentation" class="typeahead-items typeahead-accounts social-context js-typeahead-accounts block3" style="display: none;">
  
  
  <li role="presentation" class="js-selectable typeahead-accounts-shortcut js-shortcut"><a role="option" class="js-nav" href="" data-search-query="" data-query-source="typeahead_click" data-shortcut="true" data-ds="account_search" id="typeahead-item-1"></a></li>
</ul></div>
</div>

  </form>
</div>
`;

algorithm(pageContents, query)
.then(a => console.log(a))
.catch(e => console.error(e, e.stack));
