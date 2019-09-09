//const Joi = require('joi');
const express = require('express');
const request = require('request');
const moment = require('moment');

const app = express();
const url = 'https://api.darksky.net/forecast/455bb697e3a479dbbdf1db810644dcd9/45.5898,-122.5951';

app.use(express.json());

let dateArray = [];
const startDate = moment('2019-08-18');

for (const m = startDate; dateArray.length < 3; m.add(1, 'days')) {
    dateArray.push(m.format());
}

let totalCount = 0;
let usedHVAC = '';
let resultsArray = [];

    app.get('/data', (req, res) => {
        for (let i = 0; i < dateArray.length; i++) {
            let current = dateArray[i];
            getDateData(current);
        }

        function getDateData(current) {
            request(`${url},${current}?exclude={currently, minutely, flags}`, (error, response, body) => {
                result = JSON.parse(body);
                const dailyTemp = {
                    tempHigh: result.daily.data[0].temperatureHigh,
                    tempLow: result.daily.data[0].temperatureLow
                }; 
                if (dailyTemp.tempHigh > 75 || dailyTemp.tempLow < 62) {
                    usedHVAC = true;
                    totalCount++;
                }
                resultsArray.push({"date": current, "temps": [dailyTemp], "usedHVAC": usedHVAC, "totalCount": totalCount});
            });
        }
        
        res.send(resultsArray);
    });
    

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));