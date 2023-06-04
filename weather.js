const axios = require('axios');
const apiKey = `${process.env.OPEN_WEATHER_MAP_API_KEY}`;
const { httpErrorHandler } = require('./errorHandler.js');
const { countryList } = require('./countryList.js');

//function to get weather data with request parameter
async function getWeatherPara(req, res) {
   const city = req.params.city;

   const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

   try {
      const weather = await axios.get(url, { timeout: 20000 });

      res.send(weather.data);
      console.log(weather.data);
   } catch (error) {
      console.log(error);
      if (error.code == 'ECONNABORTED') {
         return res.status(504).json({
            message:
               'Your request is taking too long to process due to poor newtork. Try again later',
         });
      }
      // } else if (error.code == 'ERR_BAD_RESPONSE') {
      //    return res.status(500).json({
      //       message: 'Oops!...Something went wrong on the server.',
      //    });
      // } else if (error.response.data.cod == 404) {
      //    return res.status(404).json({
      //       message: 'City Not Found!',
      //    });
      // } else {
      //    return res.status(500).json({
      //       message: 'Oops!...Something went wrong on the server.',
      //    });
      // }
   }
}

//function to get weather data from a post request
async function getWeatherData(req, res) {
   const { location, state, country } = req.body.formData;

   console.log(location, state, country);

   let result;

   const url = `http://api.openweathermap.org/geo/1.0/direct?q=${location},${state},${country}&limit=1&appid=${apiKey}`;

   const validateLocation = function (apiLocation, apiState, apiCountryCode) {
      console.log({ apiLocation, apiState, apiCountryCode });
      let locationResult, stateResult, countryResult;

      locationResult = apiLocation.includes(location);
      stateResult = apiState.includes(state);

      const searchCountry = countryList.find((cntry) => cntry.name == country);

      if (searchCountry == undefined) {
         countryResult = false;
      } else {
         countryResult = searchCountry.code === apiCountryCode;
      }

      console.log({ locationResult, stateResult, countryResult });

      const result = locationResult && stateResult && countryResult;

      return result;
   };

   //convert location to long/lat coordinates
   try {
      const response = await axios.get(url, { timeout: 20000 });
      if (!response.data) {
         throw new Error('Oops!...Internal server error!');
      }

      console.log(response.data);

      if (!response.data[0]) {
         throw new Error('Weather data not available!');
      }

      const { name, state, country } = response.data[0];
      //console.log({ name, state, country });

      if (validateLocation(name, state, country) === false) {
         throw new Error('Location not found!');
      }

      result = response.data[0];
      console.log(result);

      //res.send(result);
   } catch (err) {
      return res.status(500).json({
         message: err.message,
      });
   }

   const { lon, lat } = result;

   //fetch weather data with long/lat
   const url2 = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${apiKey}`;

   try {
      const response = await axios.get(url2, { timeout: 20000 });

      console.log(response.data);
      res.send(response.data);
   } catch (err) {
      httpErrorHandler(err);
   }
}

module.exports = { getWeatherPara, getWeatherData };

//This file contains the function to get the weather data from openWeatherMap API
