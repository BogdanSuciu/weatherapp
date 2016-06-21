/*
 * ANGULAR SINGLE PAGE WEATHER APP - API REQUEST SERVICES
 * Version: 1.0
 * Creator: Bogdan Suciu
 * Description: The app retrieves weather data from http://api.openweathermap.org/ based on user input and displays it
 */
(function () {
  "use strict";
  // defining api communication services
  angular.module("weatherApp").factory("weatherServices", function ($http) {
    return {
      // function to make the request to the api for weather data
      callWeather: function (id, name) {
        // building the url based on the data we receive id or name
        var url = "http://api.openweathermap.org/data/2.5/weather";
        if (id) {
          url = url + "?id=" + id + "&appid=e415ee706e59a8ff7698629f0df09b28&units=metric";
        } else {
          url = url + "?q=" + name + "&appid=e415ee706e59a8ff7698629f0df09b28&units=metric";
        }
        // making the request and returning the result
        return $http.get(url).then(function (response) {
          return response.data;
        });
      }
    };
  });
})();