import { parseCSV } from './parse-csv';
import { normalizeData } from './normalize';

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
