export function normalizeData(csvData) {
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
