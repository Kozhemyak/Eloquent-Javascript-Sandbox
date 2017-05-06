'use strict'

function respond(response, status, data, type) {
  response.writeHead(status, { "Content-Type": type || "text/plain" });
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data), "application/json");
}

function sendTalks(talks, response) {
  respondJSON(response, 200, {
    serverTime: Date.now(),
    talks: talks
  });
}

function readStreamAsJSON(stream, callback) {
  var data = "";
  stream.on("data", (chunk) => {
    data += chunk;
  });
  stream.on("end", () => {
    var result, error;
    try { result = JSON.parse(data); }
    catch (e) { error = e; }
    callback(error, result);
  });
  stream.on("error", (error) => {
    callback(error);
  });
}

module.exports = {
  respond: respond,
  sendTalks: sendTalks,
  respondJSON: respondJSON,
  readStreamAsJSON: readStreamAsJSON
}