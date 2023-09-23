// import functions for later use
import {
  SelectedCurrency, // (currency)
  getCurrencySymbol, // (currencyCode)
  formatHashrate, // (hashrate)
  get_return_rate // (balance)
} from '../shared/js/functions.js';

if (localStorage.getItem("moneroStorage") !== null) {
  var moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
  var moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
}
var existingData = {balance: moneroStorage.balance, last_reward: moneroStorage.last_reward, hashrate: [], submittedHashes: moneroStorage.submittedHashes};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// clear Rigs Container and reset scrollbar position
setInterval(async () => {
  var x = true
  // Get the current scrollbar position
  let oldPos = window.scrollY;

  // Clear the rigs container
  $(".rigscontainer").empty();

  // Restore the scrollbar position after delay
  sleep(100).then(() => { 
    window.scrollTo(0, oldPos);
   });
}, 5000);


// get all values for the graphs from storage
function values() {
  // Retrieve values from local storage
  // xmrpool.eu
  var xmrpool_balance, xmrpool_last_reward, xmrpool_hashrate, xmrpool_total_hashes
  try {
    xmrpool_balance = localStorage.getItem("xmrpool_eu.balance");
    if (nanopool_balance == null) {nanopool_balance = 0}
    xmrpool_last_reward = localStorage.getItem("xmrpool_eu.last_reward");
    if (xmrpool_last_reward == null) {xmrpool_last_reward = 0}
    xmrpool_hashrate = localStorage.getItem("xmrpool_eu.hashrate");
    if (xmrpool_hashrate == null) {xmrpool_hashrate = 0}
    xmrpool_total_hashes = localStorage.getItem("xmrpool_eu.total_hashes");
    if (xmrpool_total_hashes == null) {xmrpool_total_hashes = 0}
  } catch { 
    xmrpool_balance, xmrpool_last_reward, xmrpool_hashrate, xmrpool_total_hashes = 0
  }

  // nanopool.org
  var nanopool_balance, nanopool_last_reward, nanopool_hashrate, nanopool_total_hashes
  try {
    nanopool_balance = localStorage.getItem("nanopool_org.balance");
    if (nanopool_balance == null) {nanopool_balance = 0}
    nanopool_last_reward = localStorage.getItem("nanopool_org.last_reward");
    if (nanopool_last_reward == null) {nanopool_last_reward = 0}
    nanopool_hashrate = localStorage.getItem("nanopool_org.hashrate");
    if (nanopool_hashrate == null) {nanopool_hashrate = 0}
    nanopool_total_hashes = localStorage.getItem("nanopool_org.total_hashes");
    if (nanopool_total_hashes == null) {nanopool_total_hashes = 0}
  } catch { 
    nanopool_balance, nanopool_last_reward, nanopool_hashrate, nanopool_total_hashes = 0
  }

  // Create an object to store the values
  const data = {
    balance:      (parseFloat(xmrpool_balance)      + parseFloat(nanopool_balance)).toFixed(12),
    last_reward:  (parseFloat(xmrpool_last_reward)  + parseFloat(nanopool_last_reward)),
    hashrate:     (parseFloat(xmrpool_hashrate)     + parseFloat(nanopool_hashrate)),
    total_hashes: (parseFloat(xmrpool_total_hashes) + parseFloat(nanopool_total_hashes)),
  };

  console.log(data)

  // Return the object
  return data;
}

setInterval(async () => {
  renderGraphs(values(), existingData);
}, 5000);

// run on start
renderGraphs(values(), existingData)


function renderGraphs(values, existingData) {
  // Get graph elements
  const xmrAmountGraph = document.getElementById('xmr-amount');
  const lastBlockRewardGraph = document.getElementById('last-block-reward');
  const hashrateGraph = document.getElementById('hashrate');
  const submittedHashesGraph = document.getElementById('submitted-hashes');

  // get stored values
  const display_currency = localStorage.getItem("currency"); // currency defined by the user

  // Xmr/Currency Amount Balance Graph
  const labels = [];

  if (existingData.balance.length === 0 || existingData.balance[existingData.balance.length - 1] !== values.balance) {
    if (existingData.balance.length > 7) {
      existingData.balance.splice(0, 1);
    }
    existingData.balance.push(values.balance);
  }

  $(".widget#balanceGraph #amountxmr").text(values.balance);

  // Convert XMR to the selected currency
  get_return_rate(values.balance)
    .then(currentBalance => {
      $(".widget#balanceGraph #amount").text(currentBalance + " " + getCurrencySymbol(SelectedCurrency(display_currency)));
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  for (let i = 0; i < existingData.balance.length; i++) {
    labels.push('');
  }

  const gradient = xmrAmountGraph.getContext("2d").createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0.2, '#84dc7e44');
  gradient.addColorStop(1, '#84dc7e00');

  if (Chart.getChart("xmr-amount") !== undefined) {
    Chart.getChart("xmr-amount").destroy();
  }

  new Chart(xmrAmountGraph, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '',
        data: existingData.balance,
        borderWidth: 1,
        lineTension: .4,
        pointBackgroundColor: "#ffffff00",
        pointBorderColor: "#ffffff00",
        backgroundColor: gradient
      }]
    },
    options: {
      animation: false,
      scales: {
        y: {
          beginAtZero: false,
          display: false
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      layout: {
        autoPadding: false
      }
    }
  });

  // Last Block Reward Graph

  if (existingData.last_reward.length === 0 || existingData.last_reward[existingData.last_reward.length - 1] !== values.last_reward) {
    if (existingData.last_reward.length > 7) {
      existingData.last_reward.splice(0, 1);
    }
    existingData.last_reward.push(values.last_reward);
  }

  $(".widget#lastBlockRewardGraph #amount").text(values.last_reward);

  for (let i = 0; i < existingData.last_reward.length; i++) {
    labels.push('');
  }

  const lastRewardGradient = lastBlockRewardGraph.getContext("2d").createLinearGradient(0, 0, 0, 100);
  lastRewardGradient.addColorStop(0.2, '#84dc7e44');
  lastRewardGradient.addColorStop(1, '#84dc7e00');

  if (Chart.getChart("last-block-reward") !== undefined) {
    Chart.getChart("last-block-reward").destroy();
  }

  new Chart(lastBlockRewardGraph, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '',
        data: existingData.last_reward,
        borderWidth: 1,
        lineTension: .4,
        pointBackgroundColor: "#ffffff00",
        pointBorderColor: "#ffffff00",
        backgroundColor: lastRewardGradient
      }]
    },
    options: {
      animation: false,
      scales: {
        y: {
          beginAtZero: false,
          display: false
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      layout: {
        autoPadding: false
      }
    }
  });

    // Hashrate Graph
    
    if (existingData.hashrate.length > 15) {
        existingData.hashrate.splice(0, 1);
    }
    existingData.hashrate.push(values.hashrate);

  $(".widget#hashrateWidget #amount").text(formatHashrate(values.hashrate));

  for (let i = 0; i < existingData.hashrate.length; i++) {
    labels.push('');
  }

  const hashrateGradient = hashrateGraph.getContext("2d").createLinearGradient(0, 0, 0, 100);
  hashrateGradient.addColorStop(0.2, '#84dc7e44');
  hashrateGradient.addColorStop(1, '#84dc7e00');

  if (Chart.getChart("hashrate") !== undefined) {
    Chart.getChart("hashrate").destroy();
  }

  new Chart(hashrateGraph, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '',
        data: existingData.hashrate,
        borderWidth: 1,
        lineTension: .4,
        pointBackgroundColor: "#ffffff00",
        pointBorderColor: "#ffffff00",
        backgroundColor: hashrateGradient
      }]
    },
    options: {
      animation: false,
      scales: {
        y: {
          beginAtZero: false,
          display: false
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      layout: {
        autoPadding: false
      }
    }
  });


  // calc average Hashrate
  let sum = 0
  function updateAverage(newHashrate) {
    try {
      // old hashrate´s + hashrate
      const UpdatedHashrateFloat = parseFloat(newHashrate);
      if (!isNaN(newHashrate)) {
        for (let i = 0; i < moneroStorage.hashrate.length; i++) {
          sum = sum + parseInt(moneroStorage.hashrate[i])
        }
      }
      let x = moneroStorage.hashrate.length + 1
      // return average
      return (sum / x);
    } catch {return 0}
  }

  // Update average Hashrate
  const averageHashrate = updateAverage(values.hashrate);
  $(".widget#hashrateWidget #averageamount").text(formatHashrate(averageHashrate));

  // Total Hashes Submitted Graph

  if (existingData.submittedHashes.length === 0 || existingData.submittedHashes[existingData.submittedHashes.length - 1] !== values.total_hashes) {
    if (existingData.submittedHashes.length > 7) {
      existingData.submittedHashes.splice(0, 1);
    }
    existingData.submittedHashes.push(values.total_hashes);
  }

  $(".widget#submittedHashesWidget #amount").text(values.total_hashes);

  for (let i = 0; i < existingData.submittedHashes.length; i++) {
    labels.push('');
  }

  const submittedHashesGradient = submittedHashesGraph.getContext("2d").createLinearGradient(0, 0, 0, 100);
  submittedHashesGradient.addColorStop(0.2, '#84dc7e44');
  submittedHashesGradient.addColorStop(1, '#84dc7e00');

  if (Chart.getChart("submitted-hashes") !== undefined) {
    Chart.getChart("submitted-hashes").destroy();
  }

  new Chart(submittedHashesGraph, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '',
        data: existingData.submittedHashes,
        borderWidth: 1,
        lineTension: .4,
        pointBackgroundColor: "#ffffff00",
        pointBorderColor: "#ffffff00",
        backgroundColor: submittedHashesGradient
      }]
    },
    options: {
      animation: false,
      scales: {
        y: {
          beginAtZero: false,
          display: false
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      layout: {
        autoPadding: false
      }
    }
  });

  // Update local storage
  moneroStorage.balance = existingData.balance;
  moneroStorage.last_reward = existingData.last_reward;
  moneroStorage.submittedHashes = existingData.submittedHashes;
  moneroStorage.hashrate = existingData.hashrate;
  localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));

  return existingData;
}