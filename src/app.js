/**
   CS7 SPRINT CHALLENGE NODE EXPRESS
   App.js
   ==================================================
   Server for Bitcoin compares
   --------------------------------------------------
   Version 0.0.1 2018-03-09T09:09:07
   ..................................................
   - Initial commit
   __________________________________________________
   Version 0.0.2 2018-03-09T09:33:03
   ..................................................
   - Added API reference information
   __________________________________________________
   Version 0.1.0 2018-03-09T09:37:37
   ..................................................
   - set up server to run;
   __________________________________________________
   Version 0.1.1 2018-03-09T09:48:36
   ..................................................
   - server accepts hits on /compare;
   __________________________________________________
   Version 0.1.2 2018-03-09T09:52:56
   ..................................................
   - server logs response with bare URL
   __________________________________________________
   Version 0.1.3 2018-03-09T09:59:06
   ..................................................
   - added fetch package; server runs
   __________________________________________________
   Version 0.2.0 2018-03-09T10:18:46
   ..................................................
   - set up fetch to retrieve data from BPI real-time
   - server responds to request and returns real-time
     data;
   __________________________________________________
   Version 0.2.1 2018-03-09T10:30:33
   ..................................................
   - set up fetch to retrieve data from BPI for
     yesterday; server responds to request from user;
     returns both current data and yesterday's data.
   __________________________________________________
   Version 0.2.2 2018-03-09T10:56:41
   ..................................................
   - extracted today's data and yesterday's data,
     but still need to get bpi alone;
   __________________________________________________
   Version 0.3.0 2018-03-09T11:34:34
   ..................................................
   - processed all data; supplied response with data
     including difference;
   __________________________________________________
   Version 0.3.1 2018-03-09T12:11:51
   ..................................................
   - formatted BPI prices in dollars and cents
   __________________________________________________
 */

/* CoinDesk Bitcoin Price Index API
   https://www.coindesk.com/api/
   //////////////////////////////////////////////////

 * CoinDesk provides a simple API to make its Bitcoin Price Index
   (BPI) data programmatically available to others.

 * You are free to use this API to include our data in any application
   or website as you see fit, as long as each page or app that uses it
   includes the text “Powered by CoinDesk”, linking to our price page.

   @ BPI real-time data
   ====================

 * On the CoinDesk website, we publish the BPI in USD, EUR, and GBP,
   calculated every minute.  This same data can be retrieved using the
   endpoint:

   > https://api.coindesk.com/v1/bpi/currentprice.json <

   @ Historical BPI data
   =====================

 * We offer historical data from our Bitcoin Price Index through the
   following endpoint:

   > https://api.coindesk.com/v1/bpi/historical/close.json <

 * By default, this will return the previous 31 days' worth of data.

 * This endpoint accepts the following optional parameters:

   - ?index=[USD/CNY]
   
   The index to return data for. Defaults to USD.

   - ?currency=<VALUE>

   The currency to return the data in, specified in ISO 4217
   format. Defaults to USD.

   - ?start=<VALUE>&end=<VALUE>

   Allows data to be returned for a specific date range. Must be
   listed as a pair of start and end parameters, with dates supplied
   in the YYYY-MM-DD format, e.g. 2013-09-01 for September 1st, 2013.

   - ?for=yesterday

   Specifying this will return a single value for the previous
   day. Overrides the start/end parameter.

   @ Sample JSON Response: Real-Time Request
   =========================================

   {"time":{"updated":"Mar 9, 2018 17:19:00 UTC","updatedISO":"2018-03-09T17:19:00+00:00","updateduk":"Mar 9, 2018 at 17:19 GMT"},"disclaimer":"This data was produced from the CoinDesk Bitcoin Price Index (USD). Non-USD currency data converted using hourly conversion rate from openexchangerates.org","chartName":"Bitcoin","bpi":{"USD":{"code":"USD","symbol":"$","rate":"8,789.8450","description":"United States Dollar","rate_float":8789.845},"GBP":{"code":"GBP","symbol":"£","rate":"6,340.9414","description":"British Pound Sterling","rate_float":6340.9414},"EUR":{"code":"EUR","symbol":"€","rate":"7,131.7990","description":"Euro","rate_float":7131.799}}}

   @ Sample Request and Response: Historical BPI Data
   ==================================================
   
   https://api.coindesk.com/v1/bpi/historical/close.json?start=2013-09-01&end=2013-09-05

   {"bpi":{"2013-09-01":128.2597,"2013-09-02":127.3648,"2013-09-03":127.5915,"2013-09-04":120.5738,"2013-09-05":120.5333},"disclaimer":"This data was produced from the CoinDesk Bitcoin Price Index. BPI value data returned as USD.","time":{"updated":"Sep 6, 2013 00:03:00 UTC","updatedISO":"2013-09-06T00:03:00+00:00"}}

 */

const express = require('express');
const fetch = require('node-fetch');

const PORT = 3030;
const STATUS_SUCCESS = 200;
const STATUS_NOT_FOUND = 404;

const BPI_DATA_URL = 'https://api.coindesk.com/v1/bpi';
const CURRENT_PRICE = 'currentprice.json';
const HISTORICAL_PRICE = 'historical/close.json';
const FOR_YESTERDAY = '?for=yesterday';

const bpi_display = new Intl.NumberFormat('en-US',
                                         { style: 'currency', currency: 'USD',
                                           minimumFractionDigits: 2 });

const app = express();

app.get('/compare', (req, res) => {
  console.log('You hit \'/compare\' route');

  fetch(`${BPI_DATA_URL}/${CURRENT_PRICE}`)
    .then(res => res.json())
    .then(data => {

      const bpi_current = data.bpi.USD.rate_float;

      const data_today = {
        datetime: data.time.updatedISO,
        bpi: bpi_display.format(bpi_current),
      }

      console.log('Today\'s data:\n', data_today);

      fetch(`${BPI_DATA_URL}/${HISTORICAL_PRICE}${FOR_YESTERDAY}`)
        .then(res => res.json())
        .then(yesterday => {

          const yest_bpi = Object.entries(yesterday.bpi)[0];
          const y_date = yest_bpi[0];
          const y_bpi = yest_bpi[1];

          const data_yesterday = {
            date: y_date,
            bpi: bpi_display.format(y_bpi),
          }

          const diff = bpi_current - y_bpi;

          const bpiData = {
            today: data_today,
            yesterday: data_yesterday,
            difference: bpi_display.format(diff),
          }

          console.log('Yesterday\'s closing data:\n', data_yesterday);

          res.status(STATUS_SUCCESS);
          res.send(bpiData);
        })
    })
    .catch(err => error.log(`FETCH ERROR!!! ===> ${err}`));
})







app.listen(PORT, (err) => {
  if (err) {
    error.log(`SERVER ERROR!!! ===> ${err}`);
    exit(1);
  }
  console.log(`Server listening on PORT ${PORT}`);
});
