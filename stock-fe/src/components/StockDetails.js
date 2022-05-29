import axios from 'axios';
import { useState, useEffect } from 'react';

// 1. 在 react，我們不處理 dom 物件
// 2. 相反地，我們在 react 裡控制的是「狀態」state
// => 在 react，我們只控制狀態，然後交給 react 去幫我們處理後續
// 例如，我們乖乖地透過 setXXX 通知 react 有狀態要改變，react 收到後，
// 就會去幫我們重新渲染畫面、執行「副作用」
const StockDetails = () => {
  // 宣告一個由 react 控制的狀態，這個狀態名字叫做 data
  let [data, setData] = useState([]);
  // 目前在第幾頁
  let [page, setPage] = useState(1);
  // 總筆數 1,2,3,4,5,6,...,12
  let [lastPage, setLastPage] = useState(1);

  //data = ['a','b','c'] <-- 不行直接改！！！
  // 當 useEffect 的第二個參數是空陣列的時候
  // 表示這是元件載入時的「副作用」
  useEffect(() => {
    let getPrices = async () => {
      // http://localhost:3001/stocks/2330?page=1
      let response = await axios.get('http://localhost:3001/stocks/2330', {
        params: {
          page: page,
        },
      });
      setData(response.data.data);
      // 在 react 裡，不可以直接去設定 state 變數
      // 這樣 react 會不知道這個狀態被改變
      // lastPage = response.data.pagination.lastPage;
      // 一定要透過 setXXXX 去設定狀態才可以
      setLastPage(response.data.pagination.lastPage);
      // setXXX 是一個非同步函式
      console.log('just after setLastPage:', lastPage);
    };
    getPrices();
  }, [page]);
  // 初始化的時候, page 會從沒有定義變成預設值 -> 會引發這個副作用
  // 點擊頁碼，會透過 onClick 去設定 page  setPage(i) -> 會引發副作用
  // (副作用都是在改變完成後才觸發)

  useEffect(() => {
    console.log('useEffect for lastPage:', lastPage);
  }, [lastPage]);

  const getPages = () => {
    let pages = [];
    for (let i = 1; i <= lastPage; i++) {
      // page 是我們現在在第幾頁
      pages.push(
        <li
          style={{
            display: 'inline-block',
            margin: '2px',
            backgroundColor: page === i ? '#00d1b2' : '',
            borderColor: page === i ? '#00d1b2' : '#dbdbdb',
            color: page === i ? '#fff' : '#363636',
            borderWidth: '1px',
            width: '28px',
            height: '28px',
            borderRadius: '3px',
            textAlign: 'center',
          }}
          key={i}
          onClick={(e) => {
            // 管理好 page 這個狀態
            setPage(i);
          }}
        >
          {i}
        </li>
      );
    }
    return pages;
    // pages.push(1); // [1]
    // pages.push(2); // [1, 2]
  };

  return (
    <div>
      <ul>{getPages()}</ul>
      {data.map((item) => {
        return (
          <div key={item.date} className="bg-white bg-gray-50 p-6 rounded-lg shadow m-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">日期： {item.date}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">成交金額：{item.amount}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">成交股數：{item.volume}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">開盤價：{item.open_price}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">收盤價：{item.close_price}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">漲跌價差：{item.delta_price}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">最高價：{item.high_price}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">最低價：{item.low_price}</h2>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">成交筆數：{item.transactions}</h2>
          </div>
        );
      })}
    </div>
  );
};

export default StockDetails;