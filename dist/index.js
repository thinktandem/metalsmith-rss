"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _RSS = require("rss");

var _RSS2 = _interopRequireDefault(_RSS);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

exports["default"] = function () {
  var options = arguments[0] === undefined ? {} : arguments[0];

  var _extends2 = _extends({
    feedOptions: {},
    limit: 20,
    encoding: "utf8",
    destination: "rss.xml",
    collection: "posts" }, options);

  var feedOptions = _extends2.feedOptions;
  var limit = feedOptions.limit || _extends2.limit;
  var encoding = feedOptions.encoding || _extends2.encoding;
  var destination = feedOptions.destination ||_extends2.destination;
  var collection = feedOptions.collection || _extends2.collection;

  return function (files, metalsmith, done) {
    if (!feedOptions.site_url) {
      return done(new Error("feedOptions.site_url must be configured"));
    }

    if (feedOptions.feed_url == null) {
      feedOptions.feed_url = _url2["default"].resolve(feedOptions.site_url, destination);
    }

    if (typeof limit !== "number") {
      return done(new Error("limit must be a number"));
    }

    var metadata = metalsmith.metadata();

    if (!metadata.collections) {
      return done(new Error("no collections configured - see metalsmith-collections"));
    }

    if (!metadata.collections[collection].length) {
      return done(new Error("no item in collections '" + collection + "' - see metalsmith-collections"));
    }

    var feed = new _RSS2["default"](feedOptions);
    var collectionItems = metadata.collections[collection].slice(0, limit);


    collectionItems.forEach(function (item) {
      // Note, this seemed the best way to grab the actual body since
      // metalsmith doesn't have this mechanism for some ungoldy reason
      // Code is a little meh, but it gets the job done

      // Grab the page
      var trill = new Buffer(item.contents, encoding).toString();
      // Only get stuff between the <main> tags
      var pattern = /<main[^>]*>((.|[\n\r])*)<\/main>/im;
      var body = trill.match(pattern);
      // Remove the header / nav bar.
      pattern = /<header\s*[^\>]*\>[\s\S]*?<\/header>/i;
      body = body[0].replace(pattern, '');
      // Remove the page title.
      pattern = /<h1>[\s\S]*?<\/h1>/i;
      body = body.replace(pattern, '');
      pattern = /<small>[\s\S]*?<\/small>/i;
      body = body.replace(pattern, '');
      //Remove the remaining tags and just have shorter descriptions.
      body = body.replace(/<[^>]+>/ig, '').substring(0, 750);
      body = body + '...';
      feed.item(
        _extends(
          { description: body },
          item,
          {url: item.path ? _url2["default"].resolve(feedOptions.site_url, item.path) : undefined}
        )
      );
    });

    files[destination] = {
      contents: new Buffer(feed.xml({
        indent: true }), encoding) };

    return done();
  };
};

module.exports = exports["default"];
