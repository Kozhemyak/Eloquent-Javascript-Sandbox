'use strict'

var utils = require('./utils');


var talks = Object.create(null);
var waiting = [];
var changes = [];

function waitForChanges(since, response) {
  var waiter = { since: since, response: response };
  waiting.push(waiter);
  setTimeout(() => {
    var found = waiting.indexOf(waiter);
    if (found > -1) {
      waiting.splice(found, 1);
      utils.sendTalks([], response);
    }
  }, 90 * 1000);
}

function registerChange(title) {
  changes.push({ title: title, time: Date.now() });
  waiting.forEach((waiter) => {
    utils.sendTalks(getChangedTalks(waiter.since), waiter.response);
  });
  waiting = [];
}

function getChangedTalks(since) {
  var found = [];
  function alreadySeen(title) {
    return found.some((f) => { 
      return f.title == title; 
    });
  }
  for (var i = changes.length - 1; i >= 0; i--) {
    var change = changes[i];
    if (change.time <= since) {
      break;
    } else if (alreadySeen(change.title)) {
      continue;
    } else if (change.title in talks) {
      found.push(talks[change.title]);
    } else {
      found.push({
        title: change.title,
        deleted: true
      });
    }
  }
  return found;
}

module.exports = {
  talks: talks,
  waitForChanges: waitForChanges,
  registerChange: registerChange,
  getChangedTalks: getChangedTalks
}