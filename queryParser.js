"use strict";
const natural = require("natural"),
      path = require("path"),
      Synonymator = require("synonymator"),
      syn = new Synonymator("a6f9d60ad0261cd2a8e3fc07ee54cd4c");

let input = "create new item";

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
      return types.syn;
    }
    
    return syn.lookup(word)
    .then(data => {
      switch (pos) {
        case 'NN': return format(data.noun);
        case 'VB': return format(data.verb);
        case 'JJ': return format(data.adjective);
        default:
          return format([
            ...data.noun,
            ...data.verb,
            ...data.adjective,
          ]);
      }
    });
  });

  return Promise.all(words);
}

let a = tokenize(input);
classify(a)
.then(synonymize)
.then(b => {
  console.log(b)
})
.catch(e => { console.error(e) });
