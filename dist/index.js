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
  var limit = _extends2.limit;
  var encoding = _extends2.encoding;
  var destination = _extends2.destination;
  var collection = _extends2.collection;

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
      feed.item(_extends({
        description: item.contents }, item, {
        url: item.url ? _url2["default"].resolve(feedOptions.site_url, item.url) : undefined
      }));
    });

    files[destination] = {
      contents: new Buffer(feed.xml({
        indent: true }), encoding) };

    return done();
  };
};

module.exports = exports["default"];