// FOR FUTURE USE

// Check if address is set
const StorageXMR_address = localStorage.getItem("moneroXMR_address");
if (StorageXMR_address === null) {
  window.open("./settingsPage/settingsPage.html", "_self");
  console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));
}
// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address
const display_currency = localStorage.getItem("currency"); // currency defined by the user
// XMR values
if (localStorage.getItem("moneroStorage") !== null) {
  var moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
  console.log(moneroStorage)
} else {
  var moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
  console.log(moneroStorage)
}

// import functions for later use
import {
  formatLastShareDate, // (lastShareTime)
  trimString_x, // (string, length)
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

function xmr_2miners_com_saving(walletDetails) {
  var balance = walletDetails.stats.balance ? walletDetails.stats.balance / 1000000000000 : 0;
  var last_reward = walletDetails.sumrewards[0]?.reward ? walletDetails.sumrewards[0].reward / 1000000000000 : 0;
  var hashrate = walletDetails.currentHashrate !== undefined ? unformatHashrate(walletDetails.currentHashrate) : 0;
  var total_hashes = walletDetails.hashes ? walletDetails.hashes : 0;
  
  localStorage.setItem("xmr_2miners_com.balance", balance);
  localStorage.setItem("xmr_2miners_com.last_reward", last_reward);
  localStorage.setItem("xmr_2miners_com.hashrate", hashrate);
  localStorage.setItem("xmr_2miners_com.total_hashes", total_hashes);

  // if hashrate is over 0 show xmrpool.eu as active pool
  if (hashrate > 0) {
    active_xmrpool_eu.style.display = "block"
  } else {
    active_xmrpool_eu.style.display = "none"
  }
}

// if false dont send requests
var requ = true

async function init() {
  try {
    var walletDetails = await $.get(`https://xmr.2miners.com/api/accounts/${XMR_address}`);
  } catch(e) {console.log("no account found or error: you have to mine 1 share to be visible! [2miners xmr]\n(reload site or change address in settingsto try again!)\nerror: " + e.message);requ = false;return 0}
  Chart.defaults.color = "#ffffff00"
  Chart.defaults.borderColor = '#85dc7e';
  Chart.defaults.backgroundColor = "#ffffff";
  Chart.defaults.elements.line.fill = "origin";
  xmr_2miners_com_saving(walletDetails)
  renderRigs(walletDetails);
}
init();

setInterval(async () => {
  try {
    if (requ != false) {
      var walletDetails = await $.get(`https://xmr.2miners.com/api/accounts/${XMR_address}`);
    } else {return 0}
  } catch(e) {return 0}
  xmr_2miners_com_saving(walletDetails)
  renderRigs(walletDetails);
}, 5000);


function renderRigs(walletDetails) {
  var worker_amount = walletDetails.perWorkerStats.length;

  for (let i = 0; i < worker_amount; i++) {
    let active = (walletDetails.perWorkerStats[i].hashrate !== undefined);
    let activeClass = (active) ? "active" : "";
    let hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";
    let invalidHashes, expiredHashes;

    // Calculate Percentage of Invalid Hashes
    if (walletDetails.perWorkerStats[i].invalid !== undefined) {
      const hashes = walletDetails.perWorkerStats[i].hashes - walletDetails.perWorkerStats[i].invalid;
      const invalidHashesPercentage = (walletDetails.perWorkerStats[i].invalid / hashes * 100);
      invalidHashes = walletDetails.perWorkerStats[i].invalid + ` (${invalidHashesPercentage.toFixed(2)}%)`;
    } else {
      invalidHashes = "0";
    }

    // Calculate Percentage of Expired Hashes
    if (walletDetails.perWorkerStats[i].expired !== undefined) {
      const hashes = walletDetails.perWorkerStats[i].hashes - walletDetails.perWorkerStats[i].expired;
      const expiredHashesPercentage = (walletDetails.perWorkerStats[i].expired / hashes * 100);
      expiredHashes = walletDetails.perWorkerStats[i].expired + ` (${expiredHashesPercentage.toFixed(2)}%)`;
    } else {
      expiredHashes = "0";
    }

    var workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 10);
    var lastShareTime = formatLastShareDate(walletDetails.perWorkerStats[i].lastShare);

    // Find existing elements and update their content
    var $existingRig = $(".rigs .rigscontainer #rig_2miners").eq(i);
    if ($existingRig.length > 0) {
      // Update the content of existing element
      $existingRig.html(`
        <img src="./homePage/res/2miners.png" style="padding-right: 8px; height: 20px">
        <p class="name">${workerId}</p>
        <div class="data">
          <div class="collumn">
            <p class="big">${hashrate}/s</p>
          </div>
          <div class="collumn" id="hashes">
            <p class="big">${walletDetails.perWorkerStats[i].hashes}</p>
          </div>
          <div class="collumn">
            <p class="big">${expiredHashes}</p>
          </div>
          <div class="collumn">
            <p class="big">${invalidHashes}</p>
          </div>
          <div class="collumn">
            <p class="big">${lastShareTime}</p>
          </div>
        </div>
      `);
    } else {
      // Create a new element
      $(".rigs .rigscontainer").append(`
        <div class="rig ${activeClass}" id="rig_2miners">
          <img src="./homePage/res/2miners.png" style="padding-right: 8px; height: 20px">
          <p class="name">${workerId}</p>
          <div class="data">
            <div class="collumn">
              <p class="big">${hashrate}/s</p>
            </div>
            <div class="collumn" id="hashes">
              <p class="big">${walletDetails.perWorkerStats[i].hashes}</p>
            </div>
            <div class="collumn">
              <p class="big">${expiredHashes}</p>
            </div>
            <div class="collumn">
              <p class="big">${invalidHashes}</p>
            </div>
            <div class="collumn">
              <p class="big">${lastShareTime}</p>
            </div>
          </div>
        </div>
      `);
    }
  }
}
