"use strict";
let ep = require("../roleParser"),
    assert = require("assert");

describe("roleParser", function() {
  this.slow(250);

  describe("labels", function() {
    it("should pull from aria-label", function() {
      assert.deepEqual(
        ep(`<div role="button" aria-label="my button label"></div>`),
        [{roleParents: [], role: "button", label: "my button label", content: "", state: undefined}]
      );
    });
    it("should pull from aria-labelledby", function() {
      assert.deepEqual(
        ep(`<div id="my-element">my button label</div>
            <div role="button" aria-labelledby="my-element"></div>`),
        [{roleParents: [], role: "button", label: "my button label", content: "", state: undefined}]
      );
    });
    it("should pull from aria-labelledby with nested label contents in another element", function() {
      assert.deepEqual(
        ep(`<div id="my-element">
            my button<span>label</span>
          </div>
            <div role="button" aria-labelledby="my-element"></div>`),
        [{roleParents: [], role: "button", label: "my button label", content: "", state: undefined}]
      );
    });
    it("should use the first element with aria-labelledby when there's collisions", function() {
      assert.deepEqual(
        ep(`<div id="my-element">my button label</div>
            <div id="my-element">another label</div>
            <div role="button" aria-labelledby="my-element"></div>`),
        [{roleParents: [], role: "button", label: "my button label", content: "", state: undefined}]
      );
    });
    it("should pull from id in absence of aria-labelled", function() {
      assert.deepEqual(
        ep(`<div id="my-element"></div>
            <div role="button" aria-labelledby="my-element"></div>`),
        [{roleParents: [], role: "button", label: "my element", content: "", state: undefined}]
      );
    });
    it("should fail gracefully when a label doesn't exist", function() {
      assert.deepEqual(
        ep(`<div role="button" aria-labelledby="no-exist"></div>`),
        [{roleParents: [], role: "button", label: "", content: "", state: undefined}]
      );
    });
    it("should fail gracefully without any label", function() {
      assert.deepEqual(
        ep(`<div role="button"></div>`),
        [{roleParents: [], role: "button", label: "", content: "", state: undefined}]
      );
    });
    it("should try to get label from id", function() {
      assert.deepEqual(
        ep(`<div
          id="percent-loaded"
          role="button"
        ></div>`),
        [{roleParents: [],
          role: "button", label: "percent loaded", content: "", state: undefined,
        }]
      );
    });
  });

  describe("buttons", function() {
    it("should detect role=button", function() {
      assert.deepEqual(
        ep(`<div role="button" aria-label="my button label">my content</div>`),
        [{roleParents: [], role: "button", label: "my button label", content: "my content", state: undefined}]
      );
    });
    it("should detect button element", function() {
      assert.deepEqual(
        ep(`<button aria-label="my button label">my content</button>`),
        [{roleParents: [], role: "button", label: "my button label", content: "my content", state: undefined}]
      );
    });
    it("should detect input[type=submit]", function() {
      assert.deepEqual(
        ep(`<input type="submit" aria-label="my button label" />`),
        [{roleParents: [], role: "button", label: "my button label", content: "", state: undefined}]
      );
    });
  });
  describe("progressbars", function() {
    it("should detect role=progressbar", function() {
      assert.deepEqual(
        ep(`<div
          id="percent-loaded"
          aria-label="my progressbar"
          role="progressbar"
          aria-valuenow="75"
          aria-valuemin="0"
          aria-valuemax="100"
        />`),
        [{roleParents: [],
          role: "progressbar", label: "my progressbar", content: "", state: {
            maxValue: 100,
            minValue: 0,
            value: 75,
          },
        }]
      );
    });
    it("should try to get label from id for progressbar", function() {
      assert.deepEqual(
        ep(`<div
          id="percent-loaded"
          role="progressbar"
          aria-valuenow="75"
          aria-valuemin="0"
          aria-valuemax="100"
        />`),
        [{roleParents: [],
          role: "progressbar", label: "percent loaded", content: "", state: {
            maxValue: 100,
            minValue: 0,
            value: 75,
          },
        }]
      );
    });
    it("should try get data for an unhelpful progressbar", function() {
      assert.deepEqual(
        ep(`<div
          id="percent-loaded"
          role="progressbar"
          value="75"
        />`),
        [{roleParents: [],
          role: "progressbar", label: "percent loaded", content: "", state: 75,
        }]
      );
    });
  });
});
