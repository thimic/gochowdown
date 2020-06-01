var fuse; // holds our search engine
var searchVisible = false; 
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResults'); // targets the searchResults <div>
var allRecipes = list.innerHTML;
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?


// ==========================================
// execute search as each character is typed
//
document.getElementById("searchInput").onkeyup = function(e) {
  executeSearch(this.value);
}


// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send(); 
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() { 
  fetchJSONFile('/index.json', function(data){
    var options = { // fuse.js options; check fuse.js website for details
      shouldSort: true,
      location: 0,
      distance: 100,
      threshold: 0.4,
      minMatchCharLength: 2,
      keys: [
        'title',
        'permalink',
        'summary',
        'tags',
        'category',
        'cuisine',
        'ingredients'
        ]
    };
    fuse = new Fuse(data, options); // build the index from the json file
  });
}


// ==========================================
// using the index we loaded on CMD-/, run 
// a search query (for "term") every time a letter is typed
// in the search box
//
async function executeSearch(term) {
  if (firstRun) {
    loadSearch(); // loads our json data and builds fuse.js search index
    firstRun = false; // let's never do this again
    while (!fuse) {
      await new Promise(r => setTimeout(r, 50)); // ensure fuse has loaded
    }
  }
  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket

  if (results.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = '';
    // document.getElementById("searchResults").innerHTML = allRecipes;
  } else { // build our html 
    for (let item in results) { // only show first 5 results
      searchitems = searchitems + `
      <div class="sm-col sm-col-6 md-col-6 lg-col-4 xs-px1 xs-mb2">
        <a class="block relative bg-blue" href="` + results[item].item.permalink + `">
          <div class="image ratio bg-cover" style="background-image:url(` + results[item].item.permalink + results[item].item.image + `);"></div>
          <h1 class="title p2 m0 absolute white bottom-0 left-0 title-shadow">` + results[item].item.title + `</h1>
        </a>
      </div>
      `;
    }
    resultsAvailable = true;
  }

  document.getElementById("searchResults").innerHTML = searchitems || allRecipes;
  if (results.length > 0) {
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}
