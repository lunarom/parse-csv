/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 747:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 58:
/***/ ((module) => {

module.exports = require("readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: ./parse-csv.js
const fs  = __nccwpck_require__(747);
const readline = __nccwpck_require__(58);

async function parseCSV(filePath) {
  // Each row of data from CSV will be added to entries array
  var entries = [];

  // Reading in the file line by line
  // https://nodejs.org/api/readline.html#readline_example_read_file_stream_line_by_line
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  var index = 0;
  for await (const line of rl) {
    // Skip header row, which is index 0
    if (index !== 0) {
      // Pass the raw line, and desired delimiter (comma)
      entries.push(parseLine(line, ","));
    }
    index++;
  }

  return entries;
}

function parseLine(line, delimiter) {
  // Inner function for stripping any outer quotes, then pushes to column
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
  var pushToColumn = (column) => {
    // Regex: https://stackoverflow.com/a/19156525
    var regexp = /^\"(.*)\"$/g;
    // Returns results matching a string against regex
    const matches = [...column.matchAll(regexp)];
    // If there's a result, length is > 0
    if (matches.length) {
      // Push the matched value; this is inside a nested array,
      // value we want is at index [0][1]
      // matches = [
      //   [
      //     '"28,443"',
      //     '28,443',
      //     index: 0,
      //     input: '"28,443"',
      //     groups: undefined
      //   ]
      // ]
      columns.push(matches[0][1]);
    } else {
      // No quotes found, go ahead and push
      columns.push(column);
    }
  };

  // Columns: Array of strings representing data entries from each row
  var columns = [];

  // Keep track of which char we're pointing to in the line
  // The column start is updated once we've passed an unescaped delimiter
  var columnStartIndex = 0;

  // Keep track of characters inside quotes
  // So that escaped delimiters do not break
  var insideQuote = false;

  // Go through each line, character by character
  // Grab chunks between delimiters (except when inside quotes)
  // and push to the columns array
  for (var i = 0; i < line.length; i++) {
    const currentChar = line.charAt(i);
    if (currentChar === '"') {
      insideQuote = !insideQuote;

      // We've hit a quote
      // invert the tracking boolean
      // Initially false
      // First encountered quote becomes true
      // Second encountered quote becomes false

      // "Fizz, Buzz",ABCDEF....
      // ^ - columnStartIndex = 0
      // ^ Now we are entering quote - insideQuote is true
      //      ^ delimiter is encountered, but insideQuote is still true
      //            ^ Now we are leaving - insideQuote set back to false
      //             ^ another delimiter has been encountered, and we're out of the quote
      // "Fizz, Buzz" is grabbed, with the quotes included, and inserted into the column array
      //              ^ current index of comma, plus one (i+1) added to colStartIndex, cycle continues
    } else if (currentChar === delimiter && !insideQuote) {
      // Now we have found an unescaped delimiter
      // Grab the substring from the last known startIndex, up to the delimiter itself
      // Push the data to the column array, and strip any quotes
      pushToColumn(line.substring(columnStartIndex, i));

      // Update the start index to the next character AFTER the delimiter
      // `i` is currently pointing to an unescaped delimiter
      columnStartIndex = i + 1;
    }
  }

  // The last value in the raw line does not conclude with a delimiter
  // Grab from the last colStartIndex, after the last known delimiter
  // Up until the end of the string
  pushToColumn(line.substring(columnStartIndex, line.length));
  return columns;
}

;// CONCATENATED MODULE: ./normalize.js
function normalizeData(csvData) {
  // Turn this into a nice lil' object
  return csvData.map((row) => {
    var email = row[0];

    var channelID = row[1];

    // Remove any occurrences of ...youtube.com/
    var urlRegex = /.*youtube.com\/channel\/(.*)/g;
    const urlMatches = [...channelID.matchAll(urlRegex)];
    if (urlMatches.length) {
      channelID = urlMatches[0][1];
    }

    // Remove any "UC" appended to beginning
    var ucRegex = /^UC(.*)/g;
    const ucMatches = [...channelID.matchAll(ucRegex)];
    if (ucMatches.length) {
      channelID = ucMatches[0][1];
    }

    var subscriberCount = row[2];
    // Remove commas from subscriber count
    subscriberCount = subscriberCount.replace(/,/g, "");
    // Convert to integer
    subscriberCount = parseInt(subscriberCount);
    return {
      email: email,
      channelID: channelID,
      subscriberCount: subscriberCount,
    };
  });
}

;// CONCATENATED MODULE: ./index.js



async function compareRecords(file1, file2, concerns) {
  // Allowable concerns values
  const channel_ownership = "channel_ownership";
  const subscriber_count = "subscriber_count"

  // Return error if both files not passed as params
  if(!file1 || !file2){
    throw "Error: Must include two files!";
  }
  if(file1 === file2){
    throw "Error: Files must be unique!";
  }
  if (concerns && ![channel_ownership, subscriber_count].includes(concerns)) {
    throw `Concerns must be one of the following values: "${channel_ownership}", "${subscriber_count}"`;  
  }

  try{
    var parsed1 = await parseCSV(file1);
    var parsed2 = await parseCSV(file2);

    var normalized1 = normalizeData(parsed1);
    var normalized2 = normalizeData(parsed2);
  
    // A map will allow for for quicker record access
    var file2Map = {}
    
    // Wraps each object with it's email as key for quick lookup
    normalized2.forEach((record) => {
      file2Map[record.email] = record
    })

    // Compare each record to see if there are any violations
    var discrepancies = []
    normalized1.forEach((record1) => {
      // Access corresponding record by using 1st record's email as key 
      var record2 = file2Map[record1.email];

      if(!concerns || concerns === channel_ownership) {
        // Check to see if the channel IDs differ
        if(record1.channelID != record2.channelID){
          discrepancies.push(record1.email)
        }
      }
      if(!concerns || concerns === subscriber_count) {
        // Check to see if the subscriber count differs
        if(record1.subscriberCount != record2.subscriberCount) {
          discrepancies.push(record1.email)
        }
      }
    });

    // Remove any duplicates from the descrepancy list and log the result
    [...new Set(discrepancies)].forEach((email) => console.log(email))
  } catch(err){
    console.log(err)
  }
}

;(async function main() {
    await compareRecords('./data/channels-1.csv', './data/channels-2.csv');
})();

})();

module.exports = __webpack_exports__;
/******/ })()
;