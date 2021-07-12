import { Article } from "app/articlesSlice";

interface StringMatchResult {
  matchScore: number,
  validMatch: boolean,
}

function onlySpaces(input: string) {
  let index = 0;

  while (index < input.length)  {
    if (input[index] !== " ") {
      return false;
    }
    index++;
  }

  return true;
}

function calculateStringMatchScore(haystack: string, needle: string): StringMatchResult {
  if (needle.length === 0 || onlySpaces(needle)) return {matchScore: -9999, validMatch: false};

  let haystack_index = 0;
  let needle_index = 0;

  let match_score = 0;
  let exact_match = (haystack.length === needle.length);
  let matched = 0;

  while (haystack_index < haystack.length && needle_index < needle.length) {
    while (haystack[haystack_index]?.toLowerCase() === needle[needle_index]?.toLowerCase()) {
      if (haystack[haystack_index] === needle[needle_index]) {
        match_score += 10;
      }

      if (haystack_index === needle_index) {
        match_score += 15;
      } else {
        match_score += 2;
        exact_match = false;
      }

      matched++;
      needle_index++;
    }

    match_score -= 1;
    haystack_index++;
  }

  if (needle_index >= needle.length) {
    match_score += 10;
    if (exact_match) {
      match_score += 20;
    }
  }

  if (matched === 0) {
    match_score -= 50;
  }

  return {matchScore: match_score, validMatch: matched > 0};
}

export default function approximateSearch(entries: Article[], key: string) { 
  // I wish there were transducers like in Clojure. This might be hella expensive.
  const result = entries
    .map((entry) => {
      return {
        entry: entry,
        matchScore: calculateStringMatchScore(entry.name, key)
      };
    })
    .filter((entry) => entry.matchScore.validMatch)
    .sort((entryA, entryB) => entryB.matchScore.matchScore - entryA.matchScore.matchScore)
    .map((entry) => entry.entry);
  return result;
}
