const fs  = require('fs');
const readline = require('readline');

export async function parseCSV(filePath) {
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
