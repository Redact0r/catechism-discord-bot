function searchSuggestions(repository, customerQuery) {
  // Write your code here
  const abcRep = repository.sort();
  let query = customerQuery.slice(0, 1);
  let results = [];
  for (let i = 0; i < abcRep.length; i++) {
    if (abcRep[i].substring(0, 1) === query) {
      results.push(abcRep[i]);
    }
  }
  return results.slice(0, 3);
}

let repository = ["bags", "baggage", "banner", "box", "cloths"];

let customerQuery = "bags";

console.log(searchSuggestions(repository, customerQuery));
