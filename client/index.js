import "./index.scss";
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {

  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const senderPrivatekey = document.getElementById("sender-privateKey").value;
  console.log(sender);
  console.log(amount);
  console.log(recipient);
  console.log(senderPrivatekey);
  //SIGN
  const ec = new EC('secp256k1');
  const key = ec.keyFromPrivate(senderPrivatekey);
  const message = {
    amount: amount,
    recipient:recipient,
    sender:sender
  }
  console.log(message);
  const msgHash = SHA256(message);
  console.log(msgHash);
  console.log(msgHash.words[0]);
  const signature = key.sign(msgHash.words);
  console.log(signature);
  const recid = ec.getKeyRecoveryParam(msgHash.words, signature, key.getPublic());

  const body = JSON.stringify({ 
    sender: sender.trim(), recipient: recipient.trim(), amount, recid, message, signature: {
      r: signature.r.toString(16),
      s: signature.s.toString(16)
    }
  });
  console.log(body);


  const request = new Request(`${server}/send`, { method: 'POST', body }); //connection with the server and send data

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance: balance}) => {
    document.getElementById("balance").innerHTML = balance;
  });
});