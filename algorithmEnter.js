"use strict";
const queryParser = require("./queryParser"),
      roleParser = require("./roleParser");

module.exports = function algorithm(pageContents, query) {
  let actions = roleParser(pageContents);
  console.log("ACTIONS", actions);

  let tokens = queryParser.tokenize(query);
  return queryParser.classify(tokens)
  .then(queryParser.synonymize)
  .then(words => {
    // loop through each action and find the ones with the most likelyhood to match
    // the query. (defined as above the average rank for now)
    let ranks = actions.map(a => {
      return queryParser.matchPortion(words, a.label.toLowerCase());
    });
    let avgRank = ranks.reduce((acc, i) => acc + i, 0) / ranks.length;
    let importantActions = actions.filter((a, ct) => {
      return ranks[ct] > avgRank;
    });

    return importantActions;
  })
}
