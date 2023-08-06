// Check if xmrpool.eu key is set and valid
import { StorageKey, Key_check } from 'var.js';
if (StorageKey === null || Key_check == null) {
  window.open("/settings", "_self");
  console.log("XMR key check failed: " + JSON.stringify(StorageKey));
} else {
  key = localStorage.getItem("monerokey");
}


_SelectedCurrency = localStorage.getItem("currency");

if (localStorage.getItem("moneroStorage") !== null) {
    moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
    moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
    localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
}

existingData = {balance: moneroStorage.balance, last_reward: moneroStorage.last_reward, hashrate: [], submittedHashes: moneroStorage.submittedHashes};

// get selected currency from storage and translate it to currency Code
function SelectedCurrency(_SelectedCurrency) {
    const lowercaseName = _SelectedCurrency.toLowerCase();
    return currencyCodeMap[lowercaseName] || null;
}

// get the currency symbol of the provided currency
function getCurrencySymbol(currencyCode) {
    const code = currencyCode.toLowerCase();
    return currencySymbols[code] || null;
}

// format hash rate for a better readability
function formatHashrate(hashrate) {
    if (hashrate >= 1000000) {
      return (hashrate / 1000000).toFixed(2) + ' MH/s';
    } else if (hashrate >= 1000) {
      return (hashrate / 1000).toFixed(2) + ' KH/s';
    } else {
      return hashrate.toFixed(2) + ' H/s';
    }
  }

async function init() {
    walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${key}&longpoll=false`);
    Chart.defaults.color = "#ffffff00"
    Chart.defaults.borderColor = '#85dc7e';
    Chart.defaults.backgroundColor = "#ffffff";
    Chart.defaults.elements.line.fill = "origin";
    existingData = renderGraphs(walletDetails, existingData);
    renderRigs(walletDetails);
}
init();

setInterval(async () => {
    walletDetails = await $.get(`https://web.xmrpool.eu:8119/stats_address?address=${key}&longpoll=false`);
    existingData = renderGraphs(walletDetails, existingData);
    renderRigs(walletDetails);
}, 5000);


function GetXMR_Currency_value(currentBalanceXMR) {
    const selectedCurrency = SelectedCurrency(_SelectedCurrency);
    const apiEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=${selectedCurrency}`;

    // Function to fetch the current Monero price from the API
    async function fetchMoneroPrice() {
    try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        return data.monero[selectedCurrency];
    } catch (error) {
        console.error('Error fetching Monero price:', error);
        return null;
    }
    }

    // Function to get the current timestamp
    function getCurrentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    // Function to get the stored price, timestamp from localStorage
    function getStoredPrice() {
        const storedPrice = localStorage.getItem('moneroPrice');
        const storedTimestamp = localStorage.getItem('moneroTimestamp');
        return { price: storedPrice, timestamp: parseInt(storedTimestamp) };
    }

    // Function to set the price and timestamp in localStorage
    function setStoredPrice(price, timestamp) {
        localStorage.setItem('moneroPrice', price);
        localStorage.setItem('moneroTimestamp', timestamp);
    }

    // Function to update the Monero price every 20 seconds
    async function updateMoneroPrice() {
        const storedData = getStoredPrice();
        const currentTime = getCurrentTimestamp();
        // check if Price should be forced to update
        const ForceUpdate = localStorage.getItem("ForcePriceUpdate")

        // Check if the stored price is less than 20 seconds old
        if (storedData.price && currentTime - storedData.timestamp < 20 || ForceUpdate == false) {
            // Use the stored value
            return storedData.price;
        } else {
            // reset ForceUpdate since it will be done now
            localStorage.setItem("ForcePriceUpdate", false);
            // Fetch the new price from the API
            const newPrice = await fetchMoneroPrice();
            if (newPrice) {
                setStoredPrice(newPrice, currentTime);
                console.log('Updated Monero price to:', newPrice);
                return newPrice;
            } else {
                // If there's an error fetching the new price, display its value (undefined)
                console.log('Fetching Monero price failed', newPrice);
                return newPrice;
            }
    }
    }

    return new Promise((resolve, reject) => {
    updateMoneroPrice()
        .then((xmrToCurrencyRate) => {
        // Calculate the equivalent value in the selected currency
        const currentBalance = currentBalanceXMR * xmrToCurrencyRate;

        // check if resp. is a number or not
        if (xmrToCurrencyRate === undefined || xmrToCurrencyRate === NaN) {
            resolve('N/A');
        } else {
            resolve(currentBalance.toFixed(2));
        }
        })
        .catch((error) => {
        // Reject the promise with the error
        reject(error);
        });
    });
}

// average num calc values
let sum = 0;
let count = 0;

function renderGraphs(walletDetails, existingData) {
    const xmrAmountGraph = document.getElementById('xmr-amount');
    const lastBlockRewardGraph = document.getElementById('last-block-reward');
    const hashrateGraph = document.getElementById('hashrate');
    const submittedHashesGraph = document.getElementById('submitted-hashes');

    // Xmr/Currency Amount Balance Graph
    labels = []; currentBalanceXMR = walletDetails.stats.balance / 1000000000000;
    if (existingData.balance.length === 0 || existingData.balance[existingData.balance.length - 1] !== currentBalanceXMR) {
        if (existingData.balance.length > 7) {
            existingData.balance.splice(0, 1);
        }
        existingData.balance.push(currentBalanceXMR);
    }
    $(".widget#balanceGraph #amountxmr").text(currentBalanceXMR);

    // convert xmr to the selected currency
    GetXMR_Currency_value(currentBalanceXMR)
    .then(currentBalance => {
        $(".widget#balanceGraph #amount").text(currentBalance + " " + getCurrencySymbol(SelectedCurrency(_SelectedCurrency)));
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

    for (let i = 0; i < existingData.balance.length; i++) {labels.push('');}
    
    var gradient = xmrAmountGraph.getContext("2d").createLinearGradient(0,0,0,200);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("xmr-amount") !== undefined) {Chart.getChart("xmr-amount").destroy()}
    new Chart(xmrAmountGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.balance,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}, layout: {autoPadding: false}}});
    
    
    // Last Block Reward Graph
    labels = []; currentLastReward = walletDetails.stats.last_reward / 1000000000000;
    if (existingData.last_reward.length === 0 || existingData.last_reward[existingData.last_reward.length - 1] !== currentLastReward) {
        if (existingData.last_reward.length > 7) {
            existingData.last_reward.splice(0, 1);
        }
        existingData.last_reward.push(currentLastReward);
    }
    $(".widget#lastBlockRewardGraph #amount").text(currentLastReward);

    for (let i = 0; i < existingData.last_reward.length; i++) {labels.push('');}
    
    var gradient = lastBlockRewardGraph.getContext("2d").createLinearGradient(0,0,0,100);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("last-block-reward") !== undefined) {Chart.getChart("last-block-reward").destroy()}
    new Chart(lastBlockRewardGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.last_reward,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}, layout: {autoPadding: false}}});
    
    // Hashrate Graph
    labels = []; 
    if (walletDetails.stats.hashrate.split(" ")[1] === "KH") {
        currentHertz = Number(walletDetails.stats.hashrate.split(" ")[0]) * 1000;
    } else if (walletDetails.stats.hashrate.split(" ")[1] === "MH") {
        currentHertz = Number(walletDetails.stats.hashrate.split(" ")[0]) * 1000000;
    } else {currentHertz = Number(walletDetails.stats.hashrate.split(" ")[0]);}
    
    if (existingData.hashrate.length > 15) {
        existingData.hashrate.splice(0, 1);
    }
    existingData.hashrate.push(currentHertz);

    console.log(existingData);

    $(".widget#hashrateWidget #amount").text(formatHashrate(currentHertz));

    for (let i = 0; i < existingData.hashrate.length; i++) {labels.push('');}
    
    var gradient = hashrateGraph.getContext("2d").createLinearGradient(0,0,0,100);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("hashrate") !== undefined) {Chart.getChart("hashrate").destroy()}
    new Chart(hashrateGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.hashrate,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}, layout: {autoPadding: false}}});    
    
    // calc average Hashrate
    function updateAverage(newHashrate) {
        // add 1 to count
        count++;
        // old hashrate´s + hashrate
        const UpdatedHashrateFloat = parseFloat(newHashrate);
        if (!isNaN(newHashrate)) {
            sum += UpdatedHashrateFloat;
        }
        // return average
        return (averageHashrate = sum / count);
    }
    // update average Hashrate
    averageHashrate = updateAverage(currentHertz);
    $(".widget#hashrateWidget #averageamount").text(formatHashrate(averageHashrate));

    // Total Hashes Submitted Graph
    labels = []; currentSubmittedHashes = walletDetails.stats.hashes;
    if (existingData.submittedHashes.length === 0 || existingData.submittedHashes[existingData.submittedHashes.length - 1] !== currentSubmittedHashes) {
        if (existingData.submittedHashes.length > 7) {
            existingData.submittedHashes.splice(0, 1);
        }
        existingData.submittedHashes.push(currentSubmittedHashes);
    }
    $(".widget#submittedHashesWidget #amount").text(currentSubmittedHashes);

    for (let i = 0; i < existingData.submittedHashes.length; i++) {labels.push('');}


    var gradient = submittedHashesGraph.getContext("2d").createLinearGradient(0,0,0,100);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("submitted-hashes") !== undefined) {Chart.getChart("submitted-hashes").destroy()};
    new Chart(submittedHashesGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.submittedHashes,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}, layout: {autoPadding: false}}});

    moneroStorage.balance = existingData.balance;
    moneroStorage.last_reward = existingData.last_reward;
    moneroStorage.submittedHashes = existingData.submittedHashes;
    localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
    return existingData;
}

function formatLastShareDate(lastShareTime) {
    // Given date in Unix timestamp format (seconds)
    const LastShareDateMilliseconds = lastShareTime * 1000;

    // Get the current date and time
    const currentDate = new Date();

    // Convert the given date to a Date object
    const LastShareDate = new Date(LastShareDateMilliseconds);

    // Calculate the time difference in milliseconds
    const timeDifferenceInMilliseconds = currentDate - LastShareDate;

    // Convert the time difference to days, hours, minutes, seconds and milliseconds
    const daysDifference = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));
    const hoursDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const secondsDifference = Math.floor((timeDifferenceInMilliseconds % (1000 * 60)) / 1000);
    const millisecondsDifference = timeDifferenceInMilliseconds % 1000;

    let lastShare;

    if (daysDifference > 0) {
        lastShare = daysDifference + " day" + (daysDifference === 1 ? "" : "s") + " ago";
    } else if (hoursDifference > 0) {
        lastShare = hoursDifference + " hour" + (hoursDifference === 1 ? "" : "s") + " ago";
    } else if (minutesDifference > 0) {
        lastShare = minutesDifference + " minute" + (minutesDifference === 1 ? "" : "s") + " ago";
    } else if (secondsDifference > 0) {
        lastShare = secondsDifference + " second" + (secondsDifference === 1 ? "" : "s") + " ago";
    } else {
        lastShare = millisecondsDifference + " millisecond" + (millisecondsDifference === 1 ? "" : "s") + " ago";
    }

    return lastShare.replace("-", "");
}

// trim a string after 12 chars and add "..." to the end
function trimString_x(string, length) {
    if (string.length > length) {
      return string.substring(0, length) + "...";
    } else {
      return string;
    }
}


function renderRigs(walletDetails) {
    $(".rigs .rigscontainer").html("");
    for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {
        active = (walletDetails.perWorkerStats[i].hashrate === undefined) ? false : true; activeClass = (active) ? "active" : "";
        hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";

        if (walletDetails.perWorkerStats[i].invalid === undefined) {invalidHashes = "0"} else {
            invalidHashes = walletDetails.perWorkerStats[i].invalid
            // remove invalid hashes from calculation
            hashes = walletDetails.perWorkerStats[i].hashes - invalidHashes
            // calculate Percentage of invalid hashes
            invalidHashesPercentage = (walletDetails.perWorkerStats[i].invalid / hashes * 100);
            // Display Number and Percentage
            invalidHashes = walletDetails.perWorkerStats[i].expired + ` (${invalidHashesPercentage.toFixed(2)}%)`;
        }

        if (walletDetails.perWorkerStats[i].expired === undefined) {expiredHashes = "0"} else {
            expiredHashes = walletDetails.perWorkerStats[i].expired
            // remove expired hashes from calculation
            hashes = walletDetails.perWorkerStats[i].hashes - expiredHashes
            // calculate Percentage of expired hashes
            expiredHashesPercentage = (walletDetails.perWorkerStats[i].expired / hashes * 100);
            // Display Number and Percentage
            expiredHashes = walletDetails.perWorkerStats[i].expired + ` (${expiredHashesPercentage.toFixed(2)}%)`;
        }

        if (active) {
            if (navigator.userAgentData.mobile == true) {
                workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 5)
                $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
            } else {
                workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 20)
                $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn"><p class="big">${expiredHashes}</p></div><div class="collumn"><p class="big">${invalidHashes}</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
            }
        }
        // $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="small">Hashrate</p><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="small">Accepted Hashes</p><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn" id="expired"><p class="small">Expired Hashes</p><p class="big">0</p></div><div class="collumn" id="invalid"><p class="small">Invalid Hashes</p><p class="big">0</p></div></div><div class="collumn right" id="lastshare"><p class="small">Last Share</p><p class="big">Today</p></div></div>`);
    }
    for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {
        active = (walletDetails.perWorkerStats[i].hashrate === undefined) ? false : true; activeClass = (active) ? "active" : "";
        hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";        

        if (walletDetails.perWorkerStats[i].invalid === undefined) {invalidHashes = "0"} else {
            invalidHashes = walletDetails.perWorkerStats[i].invalid
            // calculate Percentage of invalid hashes
            invalidHashesPercentage = (walletDetails.perWorkerStats[i].invalid / walletDetails.perWorkerStats[i].hashes * 100);
            // Display Number and Percentage
            invalidHashes = walletDetails.perWorkerStats[i].expired + ` (${invalidHashesPercentage.toFixed(2)}%)`;
        }

        if (walletDetails.perWorkerStats[i].expired === undefined) {expiredHashes = "0"} else {
            expiredHashes = walletDetails.perWorkerStats[i].expired
            // calculate Percentage of expired hashes
            expiredHashesPercentage = (walletDetails.perWorkerStats[i].expired / walletDetails.perWorkerStats[i].hashes * 100);
            // Display Number and Percentage
            expiredHashes = walletDetails.perWorkerStats[i].expired + ` (${expiredHashesPercentage.toFixed(2)}%)`;
        }

        if (!active) {
            if (navigator.userAgentData.mobile == true) {
                workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 5)
                $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
            } else {
                workerId = trimString_x(walletDetails.perWorkerStats[i].workerId, 20)
                $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn"><p class="big">${expiredHashes}</p></div><div class="collumn"><p class="big">${invalidHashes}</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
            }
        }
        // $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="small">Hashrate</p><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="small">Accepted Hashes</p><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn" id="expired"><p class="small">Expired Hashes</p><p class="big">0</p></div><div class="collumn" id="invalid"><p class="small">Invalid Hashes</p><p class="big">0</p></div></div><div class="collumn right" id="lastshare"><p class="small">Last Share</p><p class="big">Today</p></div></div>`);
    }
}

// check if browser is mobile to change some css
window.mobileCheck = function() {
    // check for phone and tablet
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

// if the user is using a mobile device change some website elements
if (navigator.userAgentData.mobile == true) {
    // Select the title2 div
    const title2Div = document.querySelector('.title2');

    // Remove unwanted paragraphs based on their index (2, 3, 4)
    const unwantedIndexes = [2, 3, 4];
    const paragraphs = title2Div.querySelectorAll('p');
    unwantedIndexes.forEach(index => paragraphs[index].remove());
}