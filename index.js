const express = require('express');
const request = require('request');
const moment = require('moment');

// Create an instance of an Express app
const app = express();
// Dark Sky API url including secret key and latitude/longitude for PDX
const url = 'https://api.darksky.net/forecast/455bb697e3a479dbbdf1db810644dcd9/45.5898,-122.5951';

app.use(express.json());

// Create array of 30 dates based on the startDate provided
let dateArray = [];
// TODO: this should be a value that can be passed in by the user instead of hardcoded in
const startDate = moment('2019-08-18');
for (const m = startDate; dateArray.length < 30; m.add(1, 'days')) {
    dateArray.push(m.format());
}

// Initialize variables to be used for tracking weather and counts
let totalDaysUsed = 0;
let usedHVAC = '';
let filteredData = [];
let resultsObj = {};

// GET request for defined route
    app.get('/api/weather', (req, res) => {
        // Iterate through dateArray and assign each date to the 'current' variable and pass this to getDateDate()
        for (let i = 0; i < dateArray.length; i++) {
            let current = dateArray[i];
            getDateData(current);
        }

        /**
         * getDateData() handles the request to the Dark Sky API
         * From the returned data, the tempHigh and tempLow values are extracted and used to determine if the HVAC systems were used
         * The extracted data along with the additional values of 'usedHVAC' and 'totalDaysUsed' are pushed to an array
         * which is then converted to a JSON string and sent as a response for the GET request
         */
        function getDateData(current) {
            request(`${url},${current}?exclude={currently, minutely, flags}`, (error, response, body) => {
                result = JSON.parse(body);
                const dailyTemp = {
                    tempHigh: result.daily.data[0].temperatureHigh,
                    tempLow: result.daily.data[0].temperatureLow
                }; 
                if (dailyTemp.tempHigh > 75 || dailyTemp.tempLow < 62) {
                    usedHVAC = true;
                    totalDaysUsed++;
                }
                filteredData.push({"date": current, "temps": [dailyTemp], "usedHVAC": usedHVAC, "totalDaysUsed": totalDaysUsed});
            });
        }
        resultsObj = JSON.stringify(filteredData);
        res.send(resultsObj);
    });
    
// Handles starting the app as an Express server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));