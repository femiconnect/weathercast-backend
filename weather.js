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
   } catch (error) {
      if (error.code == 'ECONNABORTED') {
         return res.status(504).json({
            message:
               'Your request is taking too long to process due to poor newtork. Try again later',
         });
      }
   }
}

//function to get weather data from a post request
async function getWeatherData(req, res) {
   const { city, country } = req.body.formData;

   let geoLocation;

   //get country as object from country list
   const searchCountry = countryList.find((cntry) => cntry.name == country);

   //1. get the geo-coordinates of the location/city
   try {
      if (searchCountry == undefined) {
         throw new Error('Location not found!');
      }

      const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${
         searchCountry.code
      }&limit=${5}&appid=${apiKey}`;

      const response = await axios.get(url, { timeout: 20000 });

      if (!response.data) {
         throw new Error('Oops!...Internal server error!');
      }

      if (response.data.length == 0) {
         throw new Error('Weather data not available...try again later!');
      }

      geoLocation = response.data[0];
   } catch (err) {
      return res.status(500).json({
         message: err.message,
      });
   }

   //2. Use the geo-cordinates to fetch the weather data
   const { lat, lon } = geoLocation;
   //fetch weather data with long/lat
   const url2 = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${apiKey}`;
   try {
      const response = await axios.get(url2, { timeout: 20000 });
      res.send(response.data);
   } catch (err) {
      httpErrorHandler(err);
   }
}

module.exports = { getWeatherPara, getWeatherData };

//This file contains the function to get the weather data from openWeatherMap API
