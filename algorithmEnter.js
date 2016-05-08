"use strict";
const queryParser = require("./queryParser"),
      roleParser = require("./roleParser");

let importantRoles = ["complementary", "search"];

module.exports = function algorithm(pageContents, query) {
  let actions = roleParser(pageContents);
  // console.info("ACTIONS", actions);

  let tokens = queryParser.tokenize(query);
  return queryParser.classify(tokens)
  .then(queryParser.synonymize)
  .then(words => {
    // loop through each action and find the ones with the most likelyhood to match
    // the query. (defined as above the average rank for now)
    let ranks = actions.map((a, ct) => {
      let match = queryParser.matchPortion(words, a.label.toLowerCase());
      let unrankedWeight = match / (a.roleParents.length + 1);
      let rankedWeight = unrankedWeight;

      // the shorter phrases are preferrable
      if (a.label.length < 10) {
        rankedWeight *= 1.05;
      }

      // If a role is one of the important ones, boost the score.
      if (a.roleParents.length && importantRoles.indexOf(a.roleParents[0]) !== -1) {
        rankedWeight *= 1.05;
      }

      return rankedWeight;
    });

    // make all ranks relative to the highest rank.
    let largestRank = ranks.reduce((largest, i) => i > largest ? i : largest, 0);
    let relRanks = ranks.map(i => i / largestRank);

    // the best are above average
    // let avgRank = ranks.reduce((acc, i) => acc + i, 0) / ranks.length;
    // let importantActions = actions.filter((b, ct) => {
    //   return ranks[ct] > avgRank;
    // });

    // the best is the top one
    // let maxRank = ranks.reduce((large, i) => {
    //   return i > large ? i : large;
    // }, 0)
    // let importantActions = [actions[ranks.indexOf(maxRank)]];

    // pick the top percentage of the relative ranked scores
    let importantActions = actions.filter((b, ct) => {
      return relRanks[ct] > 0.5;
    });

    return importantActions;
  })
}

// In general:
// The more groups something is in, the more likely they are in a deep nested
// structure that isn't important.
// Things in role=groups are more likely to be picked
// If a search term contains "search" or "find", then we'll want a role=search.
//
// So:
// Discount for every role an item is in that isn't "group".
