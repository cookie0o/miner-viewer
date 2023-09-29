// FOR FUTURE USE

// Check if address is set
const StorageXMR_address = localStorage.getItem("moneroXMR_address");
if (StorageXMR_address === null) {
  window.open("./settingsPage/settingsPage.html", "_self");
  console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));
}

// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address
const active_nanopool_org = document.getElementById("active_nanopool_org"); // xmr pool image

// XMR values
if (localStorage.getItem("moneroStorage") !== null) {
  var moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
  var moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));}

// import functions for later use
import {
  format_UNIX_time, // (lastShareTime)
  trimString_x, // (string, length)
  removePercentage, // (number + %)
} from '../shared/js/functions.js';

function unformatHashrate(hashrateStr) {
  try {
    const unitMultipliers = { KH: 1e3, MH: 1e6, GH: 1e9, TH: 1e12, PH: 1e15 };
    const [value, unit] = hashrateStr.split(' ');
    if (unit in unitMultipliers) {
      const hashrate = parseFloat(value) * unitMultipliers[unit];
      const formattedHashrate = hashrate.toFixed(0);
      return formattedHashrate;
    } else {
      return 'Invalid unit';
    }
  } catch {
    return "0"
  } 
}

function nanopool_org_saving(walletDetails) {
  var balance = walletDetails.data.balance;
  if (isNaN(balance)) {balance = 0} else {
    balance = (walletDetails.data.balance);
  }

  var last_reward = 0
  if (isNaN(last_reward)) {last_reward = 0}

  var hashrate = walletDetails.data.hashrate;
  if (hashrate == undefined) {hashrate = 0} else {
    hashrate = unformatHashrate((hashrate * 1000000000000));
  }

  var total_hashes = 0
  if (isNaN(total_hashes)) {total_hashes = 0}

  localStorage.setItem("nanopool_org.balance", balance);
  localStorage.setItem("nanopool_org.last_reward", last_reward);
  localStorage.setItem("nanopool_org.hashrate", hashrate);
  localStorage.setItem("nanopool_org.total_hashes", total_hashes);

  // if hashrate is over 0 show nanopool.org as active pool
  if (hashrate > 0) {
    active_nanopool_org.style.display = "block"
  } else {
    active_nanopool_org.style.display = "none"
  }
}

// if false dont send requests
var requ_nanopool_org = true

async function init_nanopool_org() {
  if (requ_nanopool_org == false) {return 0}
  try {
    var accExist = await $.get(`https://api.nanopool.org/v1/xmr/accountexist/${XMR_address}`);
  } catch(e) {console.log("error [nanopool.org]\n"+e.message);requ_nanopool_org=false}
  if (accExist.status != false) {
    try {
      var walletDetails = await $.get(`https://api.nanopool.org/v1/xmr/user/${XMR_address}`);
      var minerDetails = await $.get(`https://api.nanopool.org/v1/xmr/workers/${XMR_address}`);
    } catch(e) {console.log("error [nanopool.org]\n"+e.message)}
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [nanopool.org]\n(reload site or change address in settings to try again!)");
    requ_nanopool_org=false
    return 0
  }
  nanopool_org_saving(walletDetails)
  renderRigs(walletDetails, minerDetails);
}
// export function to run miner render
export {init_nanopool_org}


function renderRigs(walletDetails, minerDetails) {
  //$(".rigs .rigscontainer").html(""); // must change!

  // loop through every miner
  for (let i = 0; i < minerDetails.data.length; i++) {

    // sort list by selected order
    var SortingOrder = localStorage.getItem("sortingOrder");
    if (SortingOrder == 1) { // Hashrate
      minerDetails.data.sort((a, b) => b.hashrate - a.hashrate)
    };
    if (SortingOrder == 2) { // Accepted Hashes
      // not supported right now
    };
    if (SortingOrder == 3) { // Expired Hashes
      // not supported right now
    };
    if (SortingOrder == 4) { // Invalid Hashes
      // not supported right now
    };
    if (SortingOrder == 5) { // Last Share Time
      minerDetails.data.sort((a, b) => b.lastShare - a.lastShare)
    };
    if (SortingOrder == null) { // Don´t sort
      // don´t sort since nothing is selected
    };


    // definitions
    var workerId       = minerDetails.data[i].id
    var Hashrate       = minerDetails.data[i].hashrate
    var AllHashes      = 0//minerDetails.data[i].
    var ExpiredHashes  = 0//minerDetails.data[i].
    var InvalidHashes  = 0//minerDetails.data[i].
    var lastShareTime  = minerDetails.data[i].lastShare

    // check if miner is active
    let active = (Hashrate === undefined) ? false : true;
    let activeClass = (active) ? "active" : "";
    let HashrateFull = (active) ? Hashrate : "0 H";

    // Display values
    var invalidHashesFull, expiredHashesFull, workerIdFull, lastShareTimeFull


    // Calculate Percentage of Invalid Hashes
    if (InvalidHashes !== undefined) {
      const hashes = AllHashes - InvalidHashes;
      const invalidHashesPercentage = (InvalidHashes / hashes * 100);
      invalidHashesFull = InvalidHashes + ` (${invalidHashesPercentage.toFixed(2)}%)`;
    } else {
      invalidHashesFull = "0";
    }

    // Calculate Percentage of Expired Hashes
    if (ExpiredHashes !== undefined) {
      const hashes = AllHashes - ExpiredHashes;
      const expiredHashesPercentage = (ExpiredHashes / hashes * 100);
      expiredHashesFull = ExpiredHashes + ` (${expiredHashesPercentage.toFixed(2)}%)`;
    } else {
      expiredHashesFull = "0";
    }

    workerIdFull = trimString_x(workerId, 10);
    lastShareTimeFull = format_UNIX_time(lastShareTime, "ago")

    $(".rigs .rigscontainer").append(`
    <div class="rig ${activeClass}">
      <img src="../shared/res/xmrpool_eu.png" style="padding-right: 8px; height: 20px">
      <p class="name">${workerIdFull}</p>
      <div class="data">
        <div class="column">
          <p class="big">${HashrateFull}/s</p>
        </div>
        <div class="column" id="hashes">
          <p class="big">${AllHashes}</p>
        </div>
        <div class="column">
          <p class="big">${expiredHashesFull}</p>
        </div>
        <div class="column">
          <p class="big">${invalidHashesFull}</p>
        </div>
        <div class="column">
          <p class="big">${lastShareTimeFull}</p>
        </div>
      </div>
    </div>
    `);
  }
}
