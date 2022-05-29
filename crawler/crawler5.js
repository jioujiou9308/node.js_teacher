// read stock no from mysql database
// fetch data by stock id
// store stock price to database

/*
 * 1. 改用 moment 套件取得今日日期
 * 2. 處理抓到股價資料
 * 3. 儲存至資料庫中（批次儲存，提升效能）
 */

const axios = require('axios');

// mysql2 是一個第三方套件
// npm i mysql2
// 引用進來
const mysql = require('mysql2/promise');
// const dotenv = require('dotenv');
// dotenv.config();
// 幫我們去把 .env 裡的變數讀進來
require('dotenv').config();

// 用來處理日期的套件
const moment = require('moment');

(async () => {
  console.log('DB_HOST', process.env.DB_HOST);
  // 不要寫死日期
  let queryDate = moment().format('YYYYMMDD');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    let [data, fields] = await connection.execute('SELECT * FROM stocks');

    /************* fetch stock prices by stock list from db ************************** */
    // 整理目前資料庫裡的 stock id
    let stockIds = data.map((stock) => {
      return stock.id;
    });
    console.log('stockIds', stockIds);

    let mapResults = data.map(async (stock) => {
      let response = await axios.get('https://www.twse.com.tw/exchangeReport/STOCK_DAY', {
        params: {
          // 設定 query string
          response: 'json',
          date: queryDate,
          stockNo: stock.id,
        },
      });
      return response.data;
    });

    // mapResults
    // console.log(mapResults);
    // [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]

    let priceResults = await Promise.all(mapResults);
    // console.log(priceResults);
    /**************************************************/

    /***************** save prices to database ************************* */
    let pricesSavePromises = priceResults.map(async (stockData, idx) => {
      // console.log(stockData);
      if (!stockData.data) {
        console.warning('本次查詢失敗', stockData);
        return;
      }

      // '日期', '成交股數', '成交金額', '開盤價', '最高價', '最低價', '收盤價', '漲跌價差', '成交筆數'
      // date, volume amount open_price high_price low_price close_price delta_price transactions
      // 問題1: date: '111/01/03'
      // 問題2: 數字有逗點
      // 問題3: "符號說明:+/-/X表示漲/跌/不比價" -> 所以有可能會出現 x
      let formatData = stockData.data.map((d) => {
        // 取代掉逗點
        d = d.map((value) => {
          // value.split(",").join("")
          return value.replace(/,/g, '').replace(/X/g, '');
        });
        //取出資料後，將日期轉換成資料庫的格式
        //文件寫法原本是replace( / 要轉換的符號 /g, )=>(/ //g,) ， 但因為//是註解，電腦無法判斷，故再中間的轉換符號再+\
        //replace轉換替代完後，parseInt()將字串轉成整數10進位 後 + 19110000
        //再由moment() 以 format()格式轉換成日期格式
        d[0] = parseInt(d[0].replace(/\//g, ''), 10) + 19110000; // 20210601
        d[0] = moment(d[0], 'YYYYMMDD').format('YYYY-MM-DD'); // 2021-06-01
        d.unshift(stockIds[idx]);
        return d;
      });

      // 一整組資料一起儲存，會比一筆一筆存效率來得好
      return connection.query(
        'INSERT IGNORE INTO stock_prices (stock_id, date, volume, amount, open_price, high_price, low_price, close_price, delta_price, transactions) VALUES ?',
        [formatData]
      );
    });
    let saveResults = await Promise.all(pricesSavePromises);
    console.log(saveResults);
    /**************************************************/
  } catch (e) {
    console.error(e);
  } finally {
    connection.end();
  }
})();
//123