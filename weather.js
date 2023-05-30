const axios = require('axios');
const apiKey = `${process.env.OPEN_WEATHER_MAP_API_KEY}`;
const rapidAPIKey = `${process.env.X_RapidAPI_Key}`;
const rapidAPIHost = `${process.env.X_RapidAPI_Host}`;
const { httpErrorHandler } = require('./errorHandler.js');

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
   const { location } = req.body;

   let result;

   const options = {
      method: 'GET',
      url: 'https://address-from-to-latitude-longitude.p.rapidapi.com/geolocationapi',
      params: {
         address: location,
      },
      headers: {
         'X-RapidAPI-Key': rapidAPIKey,
         'X-RapidAPI-Host': rapidAPIHost,
      },
   };

   //convert location to long/lat coordinates
   try {
      const response = await axios.request(options);
      if (!response.data) {
         throw new Error();
      }
      result = response.data.Results[0];
   } catch (err) {
      return res.status(500).json({
         message: 'Oops!...Something went wrong on the server.',
      });
   }

   const { longitude, latitude } = result;

   //fetch weather data with long/lat
   const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&appid=${apiKey}`;

   try {
      const response = await axios.get(url, { timeout: 20000 });

      res.send(response.data);
   } catch (err) {
      httpErrorHandler(err);
   }
}

module.exports = { getWeatherPara, getWeatherData };

//This file contains the function to get the weather data from openWeatherMap API
