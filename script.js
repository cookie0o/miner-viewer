// Check if xmrpool.eu key is set.
if (localStorage.getItem("monerokey") === null) {window.open("settings/", "_self")} else {
key = localStorage.getItem("monerokey");}

_SelectedCurrency = localStorage.getItem("Currency");

if (localStorage.getItem("moneroStorage") !== null) {
    moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
    moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
    localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
}

existingData = {balance: moneroStorage.balance, last_reward: moneroStorage.last_reward, hashrate: [], submittedHashes: moneroStorage.submittedHashes};

// get selected currency from storage and translate it to currency Code
function SelectedCurrency(_SelectedCurrency) {
    const currencyCodeMap = {
        "euro (eur)": "eur",
        "united states dollar (usd)": "usd",
        "japanese yen (jpy)": "jpy",
        "british pound sterling (gbp)": "gbp",
        "canadian dollar (cad)": "cad",
        "australian dollar (aud)": "aud",
        "swiss franc (chf)": "chf",
        "chinese yuan (cny)": "cny",
        "swedish krona (sek)": "sek",
        "new zealand dollar (nzd)": "nzd",
        "south korean won (krw)": "krw",
        "singapore dollar (sgd)": "sgd",
        "hong kong dollar (hkd)": "hkd",
        "norwegian krone (nok)": "nok",
        "mexican peso (mxn)": "mxn",
        "indian rupee (inr)": "inr",
        "russian ruble (rub)": "rub",
        "south african rand (zar)": "zar",
        "brazilian real (brl)": "brl",
        "turkish lira (try)": "try",
        "emirati dirham (aed)": "aed",
        "danish krone (dkk)": "dkk",
        "polish zloty (pln)": "pln",
        "thai baht (thb)": "thb",
        "malaysian ringgit (myr)": "myr",
        "hungarian forint (huf)": "huf",
        "indonesian rupiah (idr)": "idr",
        "czech koruna (czk)": "czk",
        "israeli new shekel (ils)": "ils",
        "chilean peso (clp)": "clp",
        "philippine peso (php)": "php",
        "saudi riyal (sar)": "sar",
        "argentine peso (ars)": "ars",
        "colombian peso (cop)": "cop",
        "romanian leu (ron)": "ron",
        "peruvian sol (pen)": "pen",
        "bangladeshi taka (bdt)": "bdt",
        "kenyan shilling (kes)": "kes",
        "vietnamese dong (vnd)": "vnd",
        "nigerian naira (ngn)": "ngn",
        "ukrainian hryvnia (uah)": "uah",
        "moroccan dirham (mad)": "mad",
        "algerian dinar (dzd)": "dzd",
        "kazakhstani tenge (kzt)": "kzt",
        "qatari riyal (qar)": "qar",
        "egyptian pound (egp)": "egp",
        "bahraini dinar (bhd)": "bhd",
        "croatian kuna (hrk)": "hrk",
        "sri lankan rupee (lkr)": "lkr",
        "omani rial (omr)": "omr",
        "tunisian dinar (tnd)": "tnd",
        "guatemalan quetzal (gtq)": "gtq",
        "panamanian balboa (pab)": "pab",
        "costa rican colón (crc)": "crc",
        "uruguayan peso (uyu)": "uyu",
        "bolivian boliviano (bob)": "bob",
        "paraguayan guarani (pyg)": "pyg",
        "el salvadoran colón (svc)": "svc",
        "honduran lempira (hnl)": "hnl",
        "nicaraguan córdoba (nio)": "nio",
        "cuban peso (cup)": "cup",
        "ghanaian cedi (ghs)": "ghs",
        "icelandic króna (isk)": "isk",
        "georgian lari (gel)": "gel",
        "mongolian tögrög (mnt)": "mnt",
        "armenian dram (amd)": "amd",
        "jamaican dollar (jmd)": "jmd",
        "malawian kwacha (mwk)": "mwk",
        "zimbabwean dollar (zwl)": "zwl",
    };
    const lowercaseName = _SelectedCurrency.toLowerCase();
    return currencyCodeMap[lowercaseName] || null;
}

// get the currency symbol of the provided currency
function getCurrencySymbol(currencyCode) {
    const currencySymbols = {
        eur: "€",
        usd: "$",
        jpy: "¥",
        gbp: "£",
        cad: "C$",
        aud: "A$",
        chf: "CHF",
        cny: "CN¥",
        sek: "kr",
        nzd: "NZ$",
        krw: "₩",
        sgd: "S$",
        hkd: "HK$",
        nok: "kr",
        mxn: "Mex$",
        inr: "₹",
        rub: "₽",
        zar: "R",
        brl: "R$",
        try: "₺",
        aed: "د.إ",
        dkk: "kr",
        pln: "zł",
        thb: "฿",
        myr: "RM",
        huf: "Ft",
        idr: "Rp",
        czk: "Kč",
        ils: "₪",
        clp: "CLP$",
        php: "₱",
        sar: "﷼",
        ars: "$",
        cop: "COL$",
        ron: "lei",
        pen: "S/",
        bdt: "৳",
        kes: "Ksh",
        vnd: "₫",
        ngn: "₦",
        uah: "₴",
        mad: "د.م.",
        dzd: "دج",
        kzt: "₸",
        qar: "﷼",
        egp: "£",
        bhd: "ب.د",
        hrk: "kn",
        lkr: "₨",
        omr: "﷼",
        tnd: "د.ت",
        gtq: "Q",
        pab: "B/.",
        crc: "₡",
        uyu: "$U",
        bob: "Bs",
        pyg: "₲",
        svc: "$",
        hnl: "L",
        nio: "C$",
        cup: "₱",
        ghs: "₵",
        isk: "kr",
        gel: "₾",
        mnt: "₮",
        amd: "֏",
        jmd: "J$",
        mwk: "MK",
        zwl: "Z$",
    };
    const code = currencyCode.toLowerCase();
    return currencySymbols[code] || null;
}

// format hash rate for a better readability
function formatHashrate(hashrate) {
    if (hashrate >= 1000000) {
      return (hashrate / 1000000).toFixed(2) + ' M/s';
    } else if (hashrate >= 1000) {
      return (hashrate / 1000).toFixed(2) + ' K/s';
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
}, 10000);

function GetXMR_Currency_value(currentBalanceXMR) {
    const selectedCurrency = SelectedCurrency(_SelectedCurrency);
    const apiEndpoint = `https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=${selectedCurrency}`
    return new Promise((resolve, reject) => {
        fetch(apiEndpoint)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the API response and extract the exchange rate
            const xmrToCurrencyRate = data.monero[selectedCurrency];
    
            // Calculate the equivalent value in the selected currency
            const currentBalance = currentBalanceXMR * xmrToCurrencyRate;

            // check if resp. is a number or not
            if (xmrToCurrencyRate === undefined) {
                resolve("N/A");
              } else {
                resolve(currentBalance.toFixed(2));
              };
            })
        .catch(error => {
            // Reject the promise with the error
            reject(error);
        });
    });
}

function renderGraphs(walletDetails, existingData) {
    const xmrAmountGraph = document.getElementById('xmr-amount');
    const lastBlockRewardGraph = document.getElementById('last-block-reward');
    const hashrateGraph = document.getElementById('hashrate');
    const submittedHashesGraph = document.getElementById('submitted-hashes');

    // Xmr/Euro Amount Balance Graph
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
            $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn"><p class="big">${expiredHashes}</p></div><div class="collumn"><p class="big">${invalidHashes}</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
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
            $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn"><p class="big">${expiredHashes}</p></div><div class="collumn"><p class="big">${invalidHashes}</p></div><div class="collumn"><p class="big">${formatLastShareDate(walletDetails.perWorkerStats[i].lastShare)}</p></div></div></div>`);
        }
        // $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="small">Hashrate</p><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="small">Accepted Hashes</p><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn" id="expired"><p class="small">Expired Hashes</p><p class="big">0</p></div><div class="collumn" id="invalid"><p class="small">Invalid Hashes</p><p class="big">0</p></div></div><div class="collumn right" id="lastshare"><p class="small">Last Share</p><p class="big">Today</p></div></div>`);
    }
}