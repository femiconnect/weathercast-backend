const axios = require('axios');

function httpErrorHandler(error) {
   if (error === null) throw new Error('Unrecoverable error!! Error is null!');

   //check if the error obj is an axios error do the needful
   if (axios.isAxiosError(error)) {
      const response = error?.response;
      const request = error?.request;
      const config = error?.config;

      if (error.code === 'ERR_NETWORK') {
         return res.status(500).json({
            message: 'Problem fetching weather data..',
         });
      } else if (error.code === 'ERR_CANCELED') {
         return res.status(500).json({
            message: 'Connection canceled...',
         });
      } else if (error.code === 'ECONNABORTED') {
         return res.status(500).json({
            message:
               'Your request is taking too long to process...try again later!',
         });
      }

      //The request was made and the server responded with a status code that falls out of the range of 2xx the http status code
      if (response) {
         const statusCode = response?.status;
         if (statusCode === 404) {
            return res.status(500).json({
               message: 'Location not found',
            });
         } else if (statusCode === 401) {
            console.log('Please login to access this resource');
            //redirect user to login
         } else if (statusCode === 429) {
            return res.status(500).json({
               message: 'Too many requests...try again later!',
            });
         }
      } else if (request) {
         //The request was made but no response was received, `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in Node.js
      }
   }

   //Something happened in setting up the request and triggered an Error
   console.log(error.message);
}

module.exports = { httpErrorHandler };
