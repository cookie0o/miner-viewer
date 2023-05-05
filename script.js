if (localStorage.getItem("moneroStorage") !== null) {
    moneroStorage = JSON.parse(localStorage.getItem("moneroStorage"));
} else {
    moneroStorage = {balance: [], last_reward: [], submittedHashes: []};
    localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
}


existingData = {balance: moneroStorage.balance, last_reward: moneroStorage.last_reward, hashrate: [], submittedHashes: moneroStorage.submittedHashes};

async function init() {
    stats = await $.get("https://web.xmrpool.eu:8119/stats");
    walletDetails = await $.get("https://web.xmrpool.eu:8119/stats_address?address=41nQTjNcv2w1LUr5cUcCs8jdbmk8X1DPU3oWczodaAcmWkr59b2SSusPG24RddTf894T4RDWRVLb91GcZ4dMqjwjVA2cEbG&longpoll=false");
    Chart.defaults.color = "#ffffff00"
    Chart.defaults.borderColor = '#85dc7e';
    Chart.defaults.backgroundColor = "#ffffff";
    Chart.defaults.elements.line.fill = "origin";
    existingData = renderGraphs(walletDetails, existingData);
    renderRigs(walletDetails);
}
init();

setInterval(async () => {
    stats = await $.get("https://web.xmrpool.eu:8119/stats");
    walletDetails = await $.get("https://web.xmrpool.eu:8119/stats_address?address=41nQTjNcv2w1LUr5cUcCs8jdbmk8X1DPU3oWczodaAcmWkr59b2SSusPG24RddTf894T4RDWRVLb91GcZ4dMqjwjVA2cEbG&longpoll=false");
    existingData = renderGraphs(walletDetails, existingData);
    renderRigs(walletDetails);
}, 10000);

function renderGraphs(walletDetails, existingData) {
    const xmrAmountGraph = document.getElementById('xmr-amount');
    const lastBlockRewardGraph = document.getElementById('last-block-reward');
    const hashrateGraph = document.getElementById('hashrate');
    const submittedHashesGraph = document.getElementById('submitted-hashes');

    // Xmr Amount Balance Graph
    labels = []; currentBalance = walletDetails.stats.balance / 1000000000000;
    if (existingData.balance.length === 0 || existingData.balance[existingData.balance.length - 1] !== currentBalance) {
        if (existingData.balance.length > 7) {
            existingData.balance.splice(0, 1);
        }
        existingData.balance.push(currentBalance);
    }
    $(".widget#balanceGraph #amountxmr").text(currentBalance);

    for (let i = 0; i < existingData.balance.length; i++) {labels.push('');}
    
    var gradient = xmrAmountGraph.getContext("2d").createLinearGradient(0,0,0,200);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("xmr-amount") !== undefined) {Chart.getChart("xmr-amount").destroy()}
    new Chart(xmrAmountGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.balance,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}}});
    
    
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
    new Chart(lastBlockRewardGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.last_reward,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}}});
    
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

    $(".widget#hashrateWidget #amount").text(currentHertz);

    for (let i = 0; i < existingData.hashrate.length; i++) {labels.push('');}
    
    var gradient = hashrateGraph.getContext("2d").createLinearGradient(0,0,0,100);gradient.addColorStop(0.2, '#84dc7e44');gradient.addColorStop(1, '#84dc7e00');
    if (Chart.getChart("hashrate") !== undefined) {Chart.getChart("hashrate").destroy()}
    new Chart(hashrateGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.hashrate,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}}});
    
    
    
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
    new Chart(submittedHashesGraph, {type: 'line',data: {labels: labels,datasets: [{label: '',data: existingData.submittedHashes,borderWidth: 1,lineTension: .4,pointBackgroundColor: "#ffffff00",pointBorderColor: "#ffffff00", backgroundColor: gradient}]},options: {animation: false,scales: {y: {beginAtZero: false, display: false}, x: {display: false}},plugins: {legend: {display: false},tooltip: {enabled: false}}}});

    moneroStorage.balance = existingData.balance;
    moneroStorage.last_reward = existingData.last_reward;
    moneroStorage.submittedHashes = existingData.submittedHashes;
    localStorage.setItem("moneroStorage", JSON.stringify(moneroStorage));
    return existingData;
}

function renderRigs(walletDetails) {
    $(".rigs .rigscontainer").html("");
    for (let i = 0; i < walletDetails.perWorkerStats.length; i++) {
        active = (walletDetails.perWorkerStats[i].hashrate === undefined) ? false : true; activeClass = (active) ? "active" : "";
        hashrate = (active) ? walletDetails.perWorkerStats[i].hashrate : "0 H";


        time = Date.now() - walletDetails.perWorkerStats[i].lastShare;

        console.log(time % 86400 / 3600, time % 3600 / 60, time % 60);

        // $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="small">Hashrate</p><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="small">Accepted Hashes</p><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn" id="expired"><p class="small">Expired Hashes</p><p class="big">0</p></div><div class="collumn" id="invalid"><p class="small">Invalid Hashes</p><p class="big">0</p></div></div><div class="collumn right" id="lastshare"><p class="small">Last Share</p><p class="big">Today</p></div></div>`);
        $(".rigs .rigscontainer").append(`<div class="rig ${activeClass}"><p class="name">${walletDetails.perWorkerStats[i].workerId}</p><div class="data"><div class="collumn"><p class="small">Hashrate</p><p class="big">${hashrate}/s</p></div><div class="collumn" id="hashes"><p class="small">Accepted Hashes</p><p class="big">${walletDetails.perWorkerStats[i].hashes}</p></div><div class="collumn" id="expired"><p class="small">Expired Hashes</p><p class="big">0</p></div><div class="collumn" id="invalid"><p class="small">Invalid Hashes</p><p class="big">0</p></div></div></div>`);
    }
}