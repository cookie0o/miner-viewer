// Check if address is set
const StorageXMR_address = localStorage.getItem("moneroXMR_address");
if (StorageXMR_address === null) {
  window.open("./settingsPage/settingsPage.html", "_self");
  console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));
}

// get stored values
const XMR_address = localStorage.getItem("moneroXMR_address"); // xmr address
const active_xmrpool_eu = document.getElementById("active_xmrpool_eu"); // xmr pool image

// XMR values
if (localStorage.getItem("moneroStorage") !== null) {
  var moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
  console.log(moneroStorage)
} else {
  var moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
  console.log(moneroStorage)
}

var existingData = {
  balance: moneroStorage.balance,
  last_reward: moneroStorage.last_reward,
  hashrate: [],
  submittedHashes: moneroStorage.submittedHashes
};

// import functions for later use
import {
  formatLastShareDate, // (lastShareTime)
  trimString_x, // (string, length)
} from '../shared/js/functions.js';

function unformatHashrate(hashrateStr) {
  const unitMultipliers = { KH: 1e3, MH: 1e6, GH: 1e9, TH: 1e12, PH: 1e15 };
  const [value, unit] = hashrateStr.split(' ');
  if (unit in unitMultipliers) {
    const hashrate = parseFloat(value) * unitMultipliers[unit];
    const formattedHashrate = hashrate.toFixed(0);
    return formattedHashrate;
  } else {
    return 'Invalid unit';
  }
}

function xmrpool_eu_saving(walletDetails) {
  var balance = walletDetails.stats.balance ? walletDetails.stats.balance / 1000000000000 : 0;
  var last_reward = walletDetails.stats.last_reward ? walletDetails.stats.last_reward / 1000000000000 : 0;
  var hashrate = walletDetails.stats.hashrate !== undefined ? unformatHashrate(walletDetails.stats.hashrate) : 0;
  var total_hashes = walletDetails.stats.hashes ? walletDetails.stats.hashes : 0;
  
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

async function init() {
  var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  Chart.defaults.color = "#ffffff00"
  Chart.defaults.borderColor = '#85dc7e';
  Chart.defaults.backgroundColor = "#ffffff";
  Chart.defaults.elements.line.fill = "origin";
  xmrpool_eu_saving(walletDetails)
  renderRigs(walletDetails);
}
init();

setInterval(async () => {
  var walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${XMR_address}&longpoll=false`);
  xmrpool_eu_saving(walletDetails)
  renderRigs(walletDetails);
}, 5000);


function renderRigs(walletDetails) {
  $(".rigs .rigscontainer").html("");

  for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {
    let active = (walletDetails.perWorkerStats[i].hashrate === undefined) ? false : true;
    let activeClass = (active) ? "active" : "";
    let hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";

    let invalidHashes, expiredHashes;

    // Calculate Percentage of Invalid Hashes
    if (walletDetails.perWorkerStats[i].invalid === undefined) {
        invalidHashes = "0";
    } else {
        invalidHashes = walletDetails.perWorkerStats[i].invalid;
        const hashes = walletDetails.perWorkerStats[i].hashes - invalidHashes;
        const invalidHashesPercentage = (walletDetails.perWorkerStats[i].invalid / hashes * 100);
        invalidHashes = walletDetails.perWorkerStats[i].expired + ` (${invalidHashesPercentage.toFixed(2)}%)`;
    }

    // Calculate Percentage of Expired Hashes
    if (walletDetails.perWorkerStats[i].expired === undefined) {
        expiredHashes = "0";
    } else {
        expiredHashes = walletDetails.perWorkerStats[i].expired;
        const hashes = walletDetails.perWorkerStats[i].hashes - expiredHashes;
        const expiredHashesPercentage = (walletDetails.perWorkerStats[i].expired / hashes * 100);
        expiredHashes = walletDetails.perWorkerStats[i].expired + ` (${expiredHashesPercentage.toFixed(2)}%)`;
    }

    if (active) {
      workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 10);
      $(".rigs .rigscontainer").append(`
      <div class="rig ${activeClass}">
      <img src="./homePage/res/xmrpool_eu.png" alt="xmrpool.eu miner" style="height:20px;width:20px; padding-right: 8px">
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
            <p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p>
          </div>
        </div>
      </div>
    `)};
  }

  for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {
    let active = (walletDetails.perWorkerStats[i].hashrate === undefined) ? false : true;
    let activeClass = (active) ? "active" : "";
    let hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";

    let invalidHashes, expiredHashes;

    // Calculate Percentage of Invalid Hashes
    if (walletDetails.perWorkerStats[i].invalid === undefined) {
        invalidHashes = "0";
    } else {
        invalidHashes = walletDetails.perWorkerStats[i].invalid;
        const invalidHashesPercentage = (walletDetails.perWorkerStats[i].invalid / walletDetails.perWorkerStats[i].hashes * 100);
        invalidHashes = walletDetails.perWorkerStats[i].expired + ` (${invalidHashesPercentage.toFixed(2)}%)`;
    }

    // Calculate Percentage of Expired Hashes
    if (walletDetails.perWorkerStats[i].expired === undefined) {
        expiredHashes = "0";
    } else {
        expiredHashes = walletDetails.perWorkerStats[i].expired;
        const expiredHashesPercentage = (walletDetails.perWorkerStats[i].expired / walletDetails.perWorkerStats[i].hashes * 100);
        expiredHashes = walletDetails.perWorkerStats[i].expired + ` (${expiredHashesPercentage.toFixed(2)}%)`;
    }

    if (!active) {
      var workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 10);
      $(".rigs .rigscontainer").append(`
      <div class="rig ${activeClass}">
        <img src="./homePage/res/xmrpool_eu.png" alt="xmrpool.eu miner" style="height:20px;width:20px; padding-right: 8px">
        <p class="name">${walletDetails.perWorkerStats[i].workerId}</p>
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
            <p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p>
          </div>
        </div>
      </div>
    `)};
  }
}
