// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address
const active_xmrpool_eu = document.getElementById("active_xmrpool_eu"); // xmr pool image

// import functions for later use
import {
  unformatHashrate, // (hashrate)
  format_UNIX_time, // (lastShareTime)
  trimString_x, // (string, length)
  removePercentage, // (number + %)
} from '../shared/js/functions.js';


function xmrpool_eu_saving(walletDetails) {
  var balance = walletDetails.stats.balance;
  if (balance == undefined || isNaN(balance)) {balance = 0} else {
    balance = (walletDetails.stats.balance / 1000000000000);
  }

  var last_reward = walletDetails.stats.last_reward;
  if (last_reward == undefined || isNaN(last_reward)) {last_reward = 0} else {
    last_reward = (walletDetails.stats.last_reward / 1000000000000);
  }

  var hashrate = walletDetails.stats.hashrate;
  if (hashrate == undefined) {hashrate = 0} else {
    hashrate = unformatHashrate(hashrate);
  }

  var total_hashes = walletDetails.stats.hashes;
  if (total_hashes == undefined || isNaN(total_hashes)) {total_hashes = 0}
  
  localStorage.setItem("xmrpool_eu.balance", balance);
  localStorage.setItem("xmrpool_eu.last_reward", last_reward);
  localStorage.setItem("xmrpool_eu.hashrate", hashrate);
  localStorage.setItem("xmrpool_eu.total_hashes", total_hashes);
  

  // if hashrate is over 0 show xmrpool.eu as active pool
  if (hashrate > 0) {
    active_xmrpool_eu.style.display = "block"
  } else {
    active_xmrpool_eu.style.display = "none"
  }
}

var requ_xmrpool_eu = true

async function init_xmrpool_eu() {
  try {
    var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  } catch(e) {console.log("error [xmrpool.eu]\n"+e.message)}
  if (walletDetails.error != "Wallet address was not found.") {
    xmrpool_eu_saving(walletDetails)
    renderRigs(walletDetails);
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [xmrpool.eu]\n(reload site or change address in settings to try again!)");
    requ_xmrpool_eu = false;
    return 0
  }
  Chart.defaults.color = "#ffffff00"
  Chart.defaults.borderColor = '#85dc7e';
  Chart.defaults.backgroundColor = "#ffffff";
  Chart.defaults.elements.line.fill = "origin";
}
init_xmrpool_eu();

setInterval(async () => {
  if (requ_xmrpool_eu == false) {return 0}
  try {
    var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  } catch(e) {console.log("error [xmrpool.eu]\n"+e.message)}
  if (walletDetails.error != "Wallet address was not found.") {
    xmrpool_eu_saving(walletDetails)
    renderRigs(walletDetails);
  } else {
    console.log("no account found: you have to mine 1 share to be visible! [xmrpool.eu]\n(reload site or change address in settings to try again!)");
    requ_xmrpool_eu = false;
    return 0
  }
}, 5000);


function renderRigs(walletDetails) {
  // loop through every miner
  for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {

    // sort list by selected order
    let SortingOrder = localStorage.getItem("sortingOrder");
    if (SortingOrder == 1) { // Hashrate
      walletDetails.perWorkerStats.sort((a, b) => unformatHashrate(b.hashrate) - unformatHashrate(a.hashrate))
    };
    if (SortingOrder == 2) { // Accepted Hashes
      walletDetails.perWorkerStats.sort((a, b) => b.hashes - a.hashes)
    };
    if (SortingOrder == 3) { // Expired Hashes
      walletDetails.perWorkerStats.sort((a, b) => removePercentage(b.expired) - removePercentage(a.expired))
    };
    if (SortingOrder == 4) { // Invalid Hashes
      walletDetails.perWorkerStats.sort((a, b) => removePercentage(b.invalid) - removePercentage(a.invalid))
    };
    if (SortingOrder == 5) { // Last Share Time
      walletDetails.perWorkerStats.sort((a, b) => b.lastShare - a.lastShare)
    };
    if (SortingOrder == 6 || SortingOrder == null) { // sort by active/offline default
      walletDetails.perWorkerStats.sort((a, b) => 0 - unformatHashrate(a.hashrate))
    };


    // definitions
    var workerId       = walletDetails.perWorkerStats[i].workerId
    var Hashrate       = walletDetails.perWorkerStats[i].hashrate
    var AllHashes      = walletDetails.perWorkerStats[i].hashes
    var ExpiredHashes  = walletDetails.perWorkerStats[i].expired
    var InvalidHashes  = walletDetails.perWorkerStats[i].invalid
    var lastShareTime  = walletDetails.perWorkerStats[i].lastShare

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
      <img src="./shared/res/xmrpool_eu.png" style="padding-right: 8px; height: 20px">
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
