const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

const key = ec.genKeyPair();


// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const walletAccount = 4;
const balances = {};


//console.log(publicKey);

for (let i = 1; i < walletAccount; i++) {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate().toString(16);
  const publicKey = key.getPublic().encode('hex');
  
  const address = publicKey.slice(-40);
  console.log(`(${i})`);
  console.log(`Address : ${address}`);
  console.log(`Private Key : ${privateKey}`);
  console.log(`Public Key : ${publicKey}`);

  
  const balance = i * 100;
  

  balances[address] = balance;
  console.log(`Balance : ${balance}`);
  
  

}

console.log('==================');
console.log('');

// const balances = {
//   "1": 100,
//   "2": 50,
//   "3": 75,
// }



app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => { //get data from the client
  const {sender, signature, recipient, amount, recid} = req.body
  const message = {amount: amount}
  const msgHash = SHA256(message).words;
  const publicKey = ec.recoverPubKey(msgHash, signature, recid);
  
  console.log(publicKey);
  const key1 = ec.keyFromPublic(publicKey);
  console.log(key1.verify(msgHash, signature));

  if ((publicKey.encode("hex").slice(-40)) === sender) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
  }
  res.send({ balance: balances[sender] }); //res: response
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
