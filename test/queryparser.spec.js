"use strict";
const qp = require("../queryParser"),
      assert = require("assert"),
      Synonymator = require("synonymator"),
      sinon = require("sinon");

describe("queryParser", function() {

  describe("tokenize", function() {
    it("should tokenize a sentence", function() {
      assert.deepEqual(qp.tokenize("foo bar baz"), ["foo", "bar", "baz"]);
    });
  });

  describe("synonymize", function() {
    let fooSynonyms = ["foo", "synonyms"];
    let barSynonyms = ["bar", "synonyms"];
    let bazSynonyms = ["baz", "synonyms"];

    // make lookup always return the right thing
    beforeEach(() => {
      let lookup = sinon.stub(Synonymator.prototype, "lookup");
      lookup.withArgs("foo").resolves({noun: {syn: fooSynonyms}});
      lookup.withArgs("bar").resolves({
        verb: {syn: barSynonyms},
        noun: {syn: ["verb", "stuff"]},
      });
      lookup.withArgs("baz").resolves({
        adjective: {syn: bazSynonyms},
        noun: {syn: ["noun", "stuff"]},
      });
    });
    afterEach(() => {
      Synonymator.prototype.lookup.restore();
    });

    it("should work with one word", function() {
      return qp.synonymize([["foo", "NN"]]).then(synonyms => {
        assert.deepEqual(synonyms, [[...fooSynonyms, "foo"]]);
      });
    });
    it("should work with a bunch of words", function() {
      return qp.synonymize([["foo", "NN"], ["bar", "VB"], ["baz", "JJ"]]).then(synonyms => {
        assert.deepEqual(synonyms, [
          [...fooSynonyms, "foo"], // noun
          [...barSynonyms, "bar"], // verb
          [...bazSynonyms, "baz"], // adjective
        ]);
      });
    });
    it("should work with words with no pos", function() {
      return qp.synonymize([["bar", "bogus"]]).then(synonyms => {
        assert.deepEqual(synonyms, [
          ["verb", "stuff", ...barSynonyms, "bar"],
        ]);
      });
    });
    it("should work with no words", function() {
      return qp.synonymize([]).then(synonyms => {
        assert.deepEqual(synonyms, []);
      });
    });
  });

  describe("matchPortion", function() {
    it("should match by synonyms in a query", function() {
      assert.deepEqual(
        qp.matchPortion([
          ["foo", "bar"],
          ["baz"]
        ], "foo bogus"),
        1/2
      );
    });
    it("should match by synonyms in a query, without synonyms", function() {
      assert.deepEqual(
        qp.matchPortion([
          ["foo"],
          ["baz"]
        ], "foo bogus"),
        1/2
      );
    });
    it("should match by synonyms in a query, with nothing for a word", function() {
      assert.deepEqual(
        qp.matchPortion([
          [],
          ["baz"]
        ], "baz bogus"),
        1/2
      );
    });
    it("should match by synonyms in a query, with many words", function() {
      assert.deepEqual(
        qp.matchPortion([
          ["foo"],
          ["bar"],
          ["baz"],
        ], "foo bar bogus baz"),
        1
      );
    });
    it("should match by synonyms in a query, with no words", function() {
      assert.deepEqual(qp.matchPortion([], "bogus"), 0);
    });
    it("should work with non-string match", function() {
      assert.deepEqual(
        qp.matchPortion([
          [123],
          ["bar"],
          ["baz"],
        ], "123 bar bogus baz"),
        1
      );
    });
  });

});
