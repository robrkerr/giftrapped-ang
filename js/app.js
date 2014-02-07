'use strict';
var app;

app = angular.module('giftrappedApp', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  return $stateProvider.state('home', {
    url: '/',
    templateUrl: 'views/home.html',
    controller: 'HomeController'
  });
});

app.controller("HomeController", function($scope, $http, $filter) {
  $scope.refresh_results = function() {
    var search_url, word;
    word = $filter('lowercase')($scope.word);
    search_url = $scope.url + "search/" + word + ".json";
    return $http.get(search_url).then(function(response) {
      var match_url;
      $scope.full_word = response.data[0];
      console.log($scope.full_word);
      match_url = $scope.url + $scope.query($scope.full_word);
      console.log(match_url);
      return $http.get(match_url).then(function(response) {
        return $scope.results = response.data;
      });
    });
  };
  $scope.expanded = function(result) {
    return result.expanded === true;
  };
  $scope.not_expanded = function(result) {
    return result.expanded !== true;
  };
  $scope.expand = function(result) {
    if (result.expanded === true) {
      return result.expanded = false;
    } else {
      return result.expanded = true;
    }
  };
  $scope.query = function(word) {
    var length_option, num, s, syllables_str, syllables_str_arr, word_syllables;
    if (($scope.options_level === 1) && ($scope.query_options.match_type === "port1")) {
      s = word.syllables[word.syllables.length - 1];
      syllables_str = s.onset.label + "," + s.nucleus.label + "," + s.coda.label;
      return "match/ending/with/at-least/1/syllables/and/" + syllables_str + ".json";
    } else if (($scope.options_level === 1) && ($scope.query_options.match_type === "port2")) {
      s = word.syllables[0];
      syllables_str = s.onset.label + "," + s.nucleus.label + "," + s.coda.label;
      return "match/beginning/with/at-least/1/syllables/and/" + syllables_str + ".json";
    } else {
      num = word.num_syllables - word.last_stressed_syllable;
      if (num > 3) {
        num = 3;
      }
      word_syllables = word.syllables.slice(word.syllables.length - num, +word.syllables.length + 1 || 9e9);
      syllables_str_arr = word_syllables.map(function(s) {
        var stress;
        if (s.stress > 0) {
          stress = 3;
        } else {
          stress = 0;
        }
        return s.onset.label + "," + s.nucleus.label + stress + "," + s.coda.label;
      });
      syllables_str = "~" + syllables_str_arr.join('/');
      if (($scope.options_level === 1) && ($scope.query_options.match_length === true)) {
        length_option = "exactly/" + (word.num_syllables - num) + "/";
      } else {
        length_option = "at-least/0/";
      }
      return "match/beginning/with/" + length_option + "syllables/and/" + syllables_str + ".json";
    }
  };
  $scope.rhyming_option = function() {
    return $scope.query_options.match_type === "rhyme";
  };
  $scope.set_options_level = function(value) {
    $scope.options_level = value;
    return $scope.refresh_results();
  };
  $scope.url = "http://api.gift-rapped.com/";
  $scope.results = [];
  $scope.query_options = {};
  $scope.query_options.match_length = false;
  $scope.query_options.match_type = "rhyme";
  $scope.word = "bird";
  $scope.options_level = 0;
  return $scope.refresh_results();
});
