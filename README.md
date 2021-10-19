
# Parse CSV

A simple script for finding discrepancies between two CSV files.

## Installation

Use npm to install and run Parse CSV

```
npm i
npm run start
```

## Usage

Main entry point of the application, main() at bottom of index.js
Runs asynchronously, and calls a single function compareRecords()

compareRecords()
Required parameters:
File1 - filepath of first CSV to compare against
File2 - filepath of second CSV

Optional parameter:
concerns - allowed values of "subscriber_count", or "channel_ownership"

Running the script will output a list of emails, which have a discrepancy between the two files.
Specifying the "concerns" parameter will output only a list of emails with those specific discrepancies.

## Dev dependencies
Vercel NCC
https://github.com/vercel/ncc
Perfect for small scripts, ncc packages & builds multifile script into a single executable, that can be run with zero dependencies in any node runtime. 

## License
[MIT](https://choosealicense.com/licenses/mit/)
