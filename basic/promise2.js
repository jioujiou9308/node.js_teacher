const fs = require('fs/promises');

async function test() {
  console.log(2);
  let r = await fs.readFile('stock.txt', 'utf-8');
  console.log(r);
  return r;
}

console.log(1);
let result = test();
console.log(3, result); // promise<pending>
