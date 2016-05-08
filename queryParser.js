"use strict";
const natural = require("natural"),
      path = require("path"),
      Synonymator = require("synonymator"),
      syn = new Synonymator("a6f9d60ad0261cd2a8e3fc07ee54cd4c");

let query = "create new item";

// Step 1: tokenize the input
function tokenize(input) {
  let tokenizer = new natural.WordTokenizer();
  return tokenizer.tokenize(input);
}

// Step 2: Classify each word
function getPOSTagger(input) {
  return new Promise((resolve, reject) => {
    const base_folder = path.resolve("./node_modules/natural/lib/natural/brill_pos_tagger");
    const rules_file = base_folder + "/data/English/tr_from_posjs.txt";
    const lexicon_file = base_folder + "/data/English/lexicon_from_posjs.json";
    const default_category = 'N';

    let tagger = new natural.BrillPOSTagger(
      lexicon_file,
      rules_file,
      default_category,
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(tagger);
        }
      }
    );
  });
}
function classify(input) {
  return getPOSTagger(input)
  .then((tagger) => {
    let tags = tagger.tag(input);
    console.info("Classified tags", tags);
    return tags;
  });
}

// Step 3: return a list of synonyms for each POS tagged word
function synonymize(posInput) {
  let words = posInput.map(q => {
    let word = q[0], pos = q[1];

    // format the returned types
    function format(types) {
      return [...types.syn, word];
    }

    // take all of the contents reterned by the thesaurus and flatten
    function unionWordTypes(types) {
      if (types) {
        let all = [];
        if (types.syn) all = [...all, ...types.syn]
        if (types.sim) all = [...all, ...types.sim]
        return all;
      } else {
        return [];
      }
    }
    
    return syn.lookup(word)
    .then(data => {
      switch (pos) {
        case 'NN':
        case 'N':
          return format(data.noun);
        case 'VB': return format(data.verb);
        case 'JJ': return format(data.adjective);
        default:
          return format({syn: [
            ...unionWordTypes(data.noun),
            ...unionWordTypes(data.verb),
            ...unionWordTypes(data.adjective),
          ]});
      }
    });
  });

  return Promise.all(words);
}

// Step 4: does the given string match a query or its synonyms?
// We want to see if a given list of word synonyms matches up with a search
// query. So, for each word, check if it is contained in the query. Return a
// fraction of the amount of words contained over the total amount of words
// present.
// ex: matchPortion([["foo", "bar", "baz"]], "foo hello") returns 1/2
// ex: matchPortion([["foo", "bar", "baz"]], "foo hello world") returns 1/3
function matchPortion(dict, query, matches, nonMatches) {
  matches = matches || 0; nonMatches = nonMatches || 0;
  if (dict.length === 0 && matches === 0 && nonMatches === 0) {
    // the first iteration was empty, so we cannot do anything
    return 0;
  } else if (dict.length === 0) {
    // we're done - compute percentage of match
    return matches / (nonMatches + matches);
  } else if (dict[0].some(i => query.indexOf(i) >= 0)) { // match found
    return matchPortion(dict.slice(1), query, ++matches, nonMatches);
  } else { // no match found
    return matchPortion(dict.slice(1), query, matches, ++nonMatches);
  }
}

module.exports = {
  tokenize,
  classify,
  synonymize,
  matchPortion,
}
//
// let a = tokenize(query);
// classify(a)
// .then(synonymize)
// .then(words => {
//   console.info("Synonyms for words", words)
//   console.log(matchPortion(words, "add new"))
// })
// .catch(e => { console.error(e) });
