"use strict";
const algorithm = require("../algorithmEnter"),
      assert = require("assert"),
      sinon = require("sinon"),
      Synonymator = require("synonymator"),
      fs = require("fs"),
      path = require("path");

function getHTMLCase(name) {
  return fs.readFileSync(path.join(__dirname, "cases", `${name}.html`));
}

function fillInRole(data) {
  return Object.assign({
    role: null,
    roleParents: [],
    content: '',
    label: '',
    state: '',
  }, data);
}

describe("integration", function() {
  this.slow(500);

  let consoleinfo;
  before(() => {
    consoleinfo = console.info;
    console.info = function() {};
  });
  after(() => console.info = consoleinfo);

  describe("google", function() {
    let googleHTML;
    before(() => googleHTML = getHTMLCase("google"));

    // stub the synonyms
    beforeEach(() => {
      let lookup = sinon.stub(Synonymator.prototype, "lookup");
      lookup.withArgs("google").resolves({noun: {syn: ["google"]}});
      lookup.withArgs("search").resolves({noun: {syn: ["search"]}});
      lookup.withArgs("query").resolves({noun: {syn: ["query", "search"]}});
      lookup.withArgs("do").resolves({noun: {syn: []}});
      lookup.withArgs("a").resolves({noun: {syn: []}});
      lookup.rejects("Bad query synonym word");
    });
    afterEach(() => {
      Synonymator.prototype.lookup.restore();
    });

    it("google search", function() {
      return algorithm(googleHTML, "google search").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
    it("google", function() {
      return algorithm(googleHTML, "google").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
    it("search", function() {
      return algorithm(googleHTML, "search").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
    it("do a search", function() {
      return algorithm(googleHTML, "do a search").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
    it("query", function() {
      return algorithm(googleHTML, "query").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
    it("do a query", function() {
      return algorithm(googleHTML, "do a query").then(out => {
        assert.deepEqual(out, [fillInRole({
          role: 'button',
          label: 'Google Search',
          state: 'Google Search'
        })]);
      });
    });
  });
  describe("twitter", function() {
    let twitterHTML;
    before(() => twitterHTML = getHTMLCase("twitter"));

    // stub the synonyms
    beforeEach(() => {
      let lookup = sinon.stub(Synonymator.prototype, "lookup");
      lookup.withArgs("tweet").resolves({noun: {syn: []}});
      lookup.withArgs("create").resolves({verb: {syn: ["make", "new"]}});
      lookup.rejects("Bad query synonym word");
    });
    afterEach(() => {
      Synonymator.prototype.lookup.restore();
    });

    it("create tweet", function() {
      return algorithm(twitterHTML, "create tweet").then(out => {
        assert.deepEqual(out, [
            { role: 'button',
              roleParents: [ 'complementary' ],
              content: 'Tweet',
              label: 'global new tweet button',
              state: undefined },

            { role: 'button',
              roleParents: [],
              content: 'New Message',
              label: 'New Message',
              state: undefined
            },
            { role: 'button',
              roleParents: [],
              content: 'Remove Tweet attachment',
              label: 'Remove Tweet attachment',
              state: undefined
            },
            { role: 'button',
              roleParents: [],
              content: 'Next Tweet from user',
              label: 'Next Tweet from user',
              state: undefined
            },
            { role: 'checkbox',
              roleParents: [],
              content: '',
              label: 'include parent tweet',
              state: undefined
            },
            { role: 'textbox',
              roleParents: [],
              content: '',
              label: 'Tweet text',
              state: undefined 
            },
            { role: 'textbox',
              roleParents: [],
              content: '',
              label: 'Tweet text',
              state: undefined 
            } 
        ]);
      });
    });
  });

});
