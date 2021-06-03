function onlySpaces(str) {
  let result = true;
  let index = 0;
  while (index < str.length && result) 
    result &= str[index++] === " ";
  return result;
}
function calculateStringMatchScore(haystack, needle) {
  if (needle.length === 0 || onlySpaces(needle)) return [-9999, 0];

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

  return [match_score, matched];
}

export default function approximateSearch(entries, key) { 
  // I wish there were transducers like in Clojure. This might be hella expensive.
  const result = entries
    .map((entry) => [entry, calculateStringMatchScore(entry.name, key)])
    .filter((entry) => entry[1][1])
    .sort((entryA, entryB) => entryB[1][0] - entryA[1][0])
    .map((entry) => entry[0]);
  return result;
}
