/*
 * ANGULAR SINGLE PAGE WEATHER APP - CONTROLLER
 * Version: 1.0
 * Creator: Bogdan Suciu
 * Description: The app retrieves weather data from http://api.openweathermap.org/ based on user input and displays it
 */
(function () {
  "use strict";
  angular.module("weatherApp").controller("weatherController", function (dataServices, weatherServices, storageServices, $localStorage, $sessionStorage, $scope, $http) {
    // defining city
    $scope.city = "";
    // function to clear city and weather - used on click
    $scope.clearInput = function () {
        $scope.city = "";
        $scope.weather = null;
      }
      // creating initial local storage
    if (!storageServices.localStorage.history) {
      $scope.history = [];
      storageServices.defaultLocalStorage($scope.history);
    } else {
      $scope.history = storageServices.localStorage.history;
    }
    // creating initial session storage
    if (!storageServices.sessionStorage.callHistory) {
      $scope.callHistory = [];
      storageServices.defaultSessionStorage($scope.callHistory);
    } else {
      $scope.callHistory = dataServices.expiryCheck(storageServices.sessionStorage.callHistory);
    }
    // function to save location Id and name for later use
    $scope.saveCity = function (id, name) {
      var cityExists = false;
      // searching for current city in search history
      for (var i = 0; i < $scope.history.length; i++) {
        var record = $scope.history[i];
        if (record.id === id) {
          cityExists = true;
          break;
        }
      }
      // inserting current city in search history if we didn't find it
      if (!cityExists) {
        $scope.history.unshift({
          id: id,
          name: name
        });
        // calling storage service
        storageServices.saveToLocal("history", $scope.history);
      }
    };
    // function to save current Weather data to session storage for short term use
    $scope.saveWeather = function (id) {
      var saveTime = new Date().getTime();
      $scope.callHistory.unshift({
        id: id,
        string: $scope.city,
        data: $scope.weather,
        timeStamp: saveTime
      });
      storageServices.saveToSession("callHistory", dataServices.expiryCheck($scope.callHistory));
    };
    // function to request weather data
    $scope.getWeather = function (id, city) {
      // reseting weather and weather request error
      $scope.weather = null;
      $scope.weatherError = null;
      // activating loading overlay
      $scope.loadingData = true;
      // checking in session storage and eliminating data that is older than 10 minutes
      $scope.callHistory = dataServices.expiryCheck($scope.callHistory);
      // with the updated session weather data list we search for the current requested city
      var searchExists = false;
      for (var i = 0; i < $scope.callHistory.length; i++) {
        var record = $scope.callHistory[i];
        // first we search by city id then by user input
        if (id && id === record.id) {
          searchExists = true;
          $scope.weather = record.data;
          $scope.city = $scope.weather.name;
          $scope.loadingData = false;
          break;
        } else if (city === record.string) {
          searchExists = true;
          $scope.weather = record.data;
          $scope.loadingData = false;
          break;
        }
      }
      // making request tu server if we didnt find any valid record for the current city
      if (!searchExists) {
        weatherServices.callWeather(id, city).then(function (response) {
          // hiding loading screen
          $scope.loadingData = false;
          // checking response type and executing the apropriate code
          if (response.cod === 200) {
            $scope.weather = response;
            // updating city with the response city name
            if (id) {
              $scope.city = $scope.weather.name;
            }
            // saving current City Id and Name to local storage to be used for search history
            $scope.saveCity($scope.weather.id, $scope.weather.name);
            // saving current Weather data to session storage 
            $scope.saveWeather(response.id);
          } else {
            // sending response to error handling
            $scope.weatherError = response;
          }
        });
      } else {
        // if we already have weather data for that city we try to save it to search history
        $scope.saveCity($scope.weather.id, $scope.weather.name);
      }
    };
    // function to reset local storage 
    $scope.resetLocal = function () {
      storageServices.resetLocalStorage();
      $scope.history = [];
    };
  });
})();