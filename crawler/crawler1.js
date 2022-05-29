// hard code stock no

// npm i axios
const axios = require('axios');
// https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=20220301&stockNo=2330
axios
  .get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
    params: {
      // 設定 query string
      response: 'json',
      date: '20220301',
      stockNo: '2330',
    },
  })
  .then((response) => {
    // response 物件
    console.log(response.data);
  })
  .catch((e) => {
    console.error(e);
  });
  //132546
