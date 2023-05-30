const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });
const { getWeatherPara, getWeatherData } = require('./weather.js');

const app = express();

//app.use(express.urlencoded());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({ origin: true }));

app.get('/', (req, res) => {
   console.log(req.body);

   res.send(
      'Welcome to my Weather App backend for fetching weather data from OpenWeatherMap...'
   );
});

app.get('/:city', getWeatherPara);

app.post('/', getWeatherData);

app.get('*', (req, res) => {
   res.send('Page Not Found...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
