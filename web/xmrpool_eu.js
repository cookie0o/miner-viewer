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
}
// export function to run miner render
export {init_xmrpool_eu}


function renderRigs(walletDetails) {
  // Initialize worker amount
  var worker_amount = walletDetails.perWorkerStats.length;

  // Loop through every miner
  for (let i = 0; i < worker_amount; i++) {
    // Sort list by selected order
    let SortingOrder = localStorage.getItem("sortingOrder");
    if (SortingOrder == 1) { // Hashrate
      walletDetails.perWorkerStats.sort((a, b) => unformatHashrate(b.hashrate) - unformatHashrate(a.hashrate))
    } else if (SortingOrder == 2) { // Accepted Hashes
      walletDetails.perWorkerStats.sort((a, b) => b.hashes - a.hashes)
    } else if (SortingOrder == 3) { // Expired Hashes
      walletDetails.perWorkerStats.sort((a, b) => removePercentage(b.expired) - removePercentage(a.expired))
    } else if (SortingOrder == 4) { // Invalid Hashes
      walletDetails.perWorkerStats.sort((a, b) => removePercentage(b.invalid) - removePercentage(a.invalid))
    } else if (SortingOrder == 5) { // Last Share Time
      walletDetails.perWorkerStats.sort((a, b) => b.lastShare - a.lastShare)
    } else { // Sort by active/offline default
      walletDetails.perWorkerStats.sort((a, b) => 0 - unformatHashrate(a.hashrate))
    }

    // Definitions
    var workerId = walletDetails.perWorkerStats[i].workerId;
    var Hashrate = walletDetails.perWorkerStats[i].hashrate;
    var AllHashes = walletDetails.perWorkerStats[i].hashes;
    var ExpiredHashes = walletDetails.perWorkerStats[i].expired;
    var InvalidHashes = walletDetails.perWorkerStats[i].invalid;
    var lastShareTime = walletDetails.perWorkerStats[i].lastShare;

    // Check if miner is active
    let active = (Hashrate !== undefined);
    let activeClass = (active) ? "active" : "";
    let HashrateFull = (active) ? Hashrate : "0 H";

    // Calculate Percentage of Invalid Hashes
    var invalidHashesFull;
    if (InvalidHashes !== undefined) {
      const hashes = AllHashes - InvalidHashes;
      const invalidHashesPercentage = (InvalidHashes / hashes * 100);
      invalidHashesFull = InvalidHashes + ` (${invalidHashesPercentage.toFixed(2)}%)`;
    } else {
      invalidHashesFull = "0";
    }

    // Calculate Percentage of Expired Hashes
    var expiredHashesFull;
    if (ExpiredHashes !== undefined) {
      const hashes = AllHashes - ExpiredHashes;
      const expiredHashesPercentage = (ExpiredHashes / hashes * 100);
      expiredHashesFull = ExpiredHashes + ` (${expiredHashesPercentage.toFixed(2)}%)`;
    } else {
      expiredHashesFull = "0";
    }

    var workerIdFull = trimString_x(workerId, 10);
    var lastShareTimeFull = format_UNIX_time(lastShareTime, "ago");

    // Find existing elements and update their content
    var $existingRigs = $(".rigs .rigscontainer #rig_xmrpool_eu").eq(i);
    if ($existingRigs.length > 0) {
      // Update the content of existing elements
      $existingRigs.find('.name').text(workerIdFull);
      $existingRigs.find('.hashrate').text(HashrateFull + "/s");
      $existingRigs.find('#hashes').text(AllHashes);
      $existingRigs.find('.expired').text(expiredHashesFull);
      $existingRigs.find('.invalid').text(invalidHashesFull);
      $existingRigs.find('.last-share').text(lastShareTimeFull);
    } else {
      // Create a new element
      var newElement = `
        <div class="rig ${activeClass}" id="rig_xmrpool_eu">
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
        </div>`;
      // Append the new element to the container
      $(".rigs .rigscontainer").append(newElement);
    }
  }
}