'use strict'

var url = require('url');

class Router {
  constructor() {
    this.routes = [];
  }

  add(method, url, handler) {
    console.info('-route was added : [' + url + ']');
    this.routes.push({
      method: method,
      url: url,
      handler: handler
    });
  }

  resolve(request, response) {
    var path = url.parse(request.url).pathname;

    return this.routes.some((route) => {
      var match = route.url.exec(path);

      if (!match || route.method != request.method) {
        return false;
      }
      var urlParts = match.slice(1).map(decodeURIComponent);
      route.handler.apply(null, [request, response].concat(urlParts));
      return true;
    });
  }
}

module.exports = Router;