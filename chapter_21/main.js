'use strict'


var http = require("http");
var Router = require("./server/router");
var Router = require("./server/router");
var ecstatic = require("ecstatic");
var utils = require('./server/utils');
var longQuery = require('./server/longquery');

var fileServer = ecstatic({root: "./public"});
var router = new Router();

http.createServer(function(request, response) {
  if (!router.resolve(request, response))
    fileServer(request, response);
}).listen(80);


router.add("GET", /^\/talks\/([^\/]+)$/,
           function(request, response, title) {
  if (title in talks)
    utils.respondJSON(response, 200, longQuery.talks[title]);
  else
    utils.respond(response, 404, "No talk '" + title + "' found");
});

router.add("DELETE", /^\/talks\/([^\/]+)$/,
           function(request, response, title) {
  if (title in longQuery.talks) {
    delete longQuery.talks[title];
    longQuery.registerChange(title);
  }
  utils.respond(response, 204, null);
});

router.add("PUT", /^\/talks\/([^\/]+)$/,
           function(request, response, title) {
  utils.readStreamAsJSON(request, function(error, talk) {
    if (error) {
      utils.respond(response, 400, error.toString());
    } else if (!talk ||
               typeof talk.presenter != "string" ||
               typeof talk.summary != "string") {
      utils.respond(response, 400, "Bad talk data");
    } else {
      longQuery.talks[title] = {title: title,
                      presenter: talk.presenter,
                      summary: talk.summary,
                      comments: []};
      longQuery.registerChange(title);
      utils.respond(response, 204, null);
    }
  });
});

router.add("POST", /^\/talks\/([^\/]+)\/comments$/,
           function(request, response, title) {
  utils.readStreamAsJSON(request, function(error, comment) {
    if (error) {
      utils.respond(response, 400, error.toString());
    } else if (!comment ||
               typeof comment.author != "string" ||
               typeof comment.message != "string") {
      utils.respond(response, 400, "Bad comment data");
    } else if (title in longQuery.talks) {
      longQuery.talks[title].comments.push(comment);
      longQuery.registerChange(title);
      utils.respond(response, 204, null);
    } else {
      utils.respond(response, 404, "No talk '" + title + "' found");
    }
  });
});

router.add("GET", /^\/talks$/, function(request, response) {
  var query = require("url").parse(request.url, true).query;
  if (query.changesSince == null) {
    var list = [];
    for (var title in longQuery.talks)
      list.push(longQuery.talks[title]);
    utils.sendTalks(list, response);
  } else {
    var since = Number(query.changesSince);
    if (isNaN(since)) {
      utils.respond(response, 400, "Invalid parameter");
    } else {
      var changed = longQuery.getChangedTalks(since);
      if (changed.length > 0)
         utils.sendTalks(changed, response);
      else
        longQuery.waitForChanges(since, response);
    }
  }
});