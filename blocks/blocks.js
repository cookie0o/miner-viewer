// format time from UNIX timestamp
function formatTime(timestamp) {
    const currentTimestamp = Date.now();
    const timeDifference = currentTimestamp - timestamp;
  
    const millisecondsPerSecond = 1000;
    const millisecondsPerMinute = millisecondsPerSecond * 60;
    const millisecondsPerHour = millisecondsPerMinute * 60;
    const millisecondsPerDay = millisecondsPerHour * 24;
  
    if (timeDifference >= millisecondsPerDay) {
      const days = Math.floor(timeDifference / millisecondsPerDay);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (timeDifference >= millisecondsPerHour) {
      const hours = Math.floor(timeDifference / millisecondsPerHour);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (timeDifference >= millisecondsPerMinute) {
      const minutes = Math.floor(timeDifference / millisecondsPerMinute);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (timeDifference >= millisecondsPerSecond) {
      const seconds = Math.floor(timeDifference / millisecondsPerSecond);
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
}

// format Difficulty
function formatDifficulty(difficulty) {
    if (difficulty >= 1e12) {
        return (difficulty / 1e12).toFixed(3) + " T";
    } else if (difficulty >= 1e9) {
        return (difficulty / 1e9).toFixed(3) + " G";
    } else if (difficulty >= 1e6) {
        return (difficulty / 1e6).toFixed(3) + " M";
    } else if (difficulty >= 1e3) {
        return (difficulty / 1e3).toFixed(3) + " k";
    } else {
        return difficulty.toFixed(3) + " /s";
    }
}

// fetch blocks from the blockchain
async function fetchBlockData() {
  const apiEndpoint = `https://supportxmr.com/api/pool/blocks`;
  const response = await fetch(apiEndpoint);
  const dataRaw = await response.json();
  return dataRaw; // Return the entire array of blocks
}

// trim a string after 4 chars and add "..." to the end
function trimString(string) {
    if (string.length > 3) {
      return string.substring(0, 3) + "...";
    } else {
      return string;
    }
}

// list blocks on ui
async function ListBlocks() {
    $(".blocks .blockscontainer").html("");
    const blockDataArray = await fetchBlockData(); // Fetch all blocks

    for (let i = 0; i < blockDataArray.length; i++) {
        const blockData = blockDataArray[i];

        // calculate block age from UNIX timestamp
        const blockAge = formatTime(blockData.ts);
        // format block difficulty
        const difficulty = formatDifficulty(blockData.diff)

        if (navigator.userAgentData.mobile == true) {
            // change display
            hash_mobile = trimString(blockData.hash);
            $(".blocks .blockscontainer").append(`<div class="block"><p class="hash_mobile">${hash_mobile}</p><div class="data"><div class="collumn"><p class="big">${difficulty}/s</p></div><div class="collumn" id="difficulty"><p class="big">${blockData.height}</p></div><div class="collumn"><p class="big">${blockAge}</p></div></div></div>`);
        } else {
            $(".blocks .blockscontainer").append(`<div class="block"><p class="hash">${blockData.hash}</p><div class="data"><div class="collumn"><p class="big">${difficulty}/s</p></div><div class="collumn" id="difficulty"><p class="big">${blockData.height}</p></div><div class="collumn"><p class="big">${blockAge}</p></div></div></div>`);  
        }
    }
}

// run function every 20sec
ListBlocks();
setInterval(ListBlocks, 20000);

// if the user is using a mobile device change some website elements
if (navigator.userAgentData.mobile == true) {
  // Find the element with class "hash"
  const hashElement = document.querySelector('.hash');
  // add the hash_mobile class and remove hash class
  if (hashElement) {
      hashElement.classList.add('hash_mobile');
      hashElement.classList.remove('hash');
  }
}

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('navbar_btn_');

// Function to open the sidebar
function openSidebar() {
  sidebar.classList.remove('sidebar-closed');
  sidebar.classList.add('sidebar-open');
}

// Function to close the sidebar
function closeSidebar() {
  sidebar.classList.remove('sidebar-open');
  sidebar.classList.add('sidebar-closed');
}

// Function to toggle the sidebar on button click
function toggleSidebar() {
  console.log("clicked");
  if (sidebar.classList.contains('sidebar-open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}
// Event listener to toggle the sidebar on button click
toggleBtn.addEventListener('click', toggleSidebar);


// fetchBlockData.hash
/**
https://supportxmr.com/api/pool/blocks

example resp:
[{"ts":"1690753261488","hash":"ea4952b1e806ad81805055b31e94dc8ddd45c6e250bbffc9daa8abea1787f125","diff":"276602074207","shares":"111375066792","height":2941266,"valid":true,"unlocked":false,"pool_type":"pplns","value":"603512660000","finder":"Being Implemented"},
{"ts":"1690753050327","hash":"e7cd0fa6575da50d66304564bf6092d152979cfb464d0f6eb7f326ca8aef9783","diff":"276526864928","shares":"898544823864","height":2941263,"valid":true,"unlocked":false,"pool_type":"pplns","value":"611933540000","finder":"Being Implemented"},
{"ts":"1690751355995","hash":"263355f96e18ad386bc062df39d985bef496dc137240ad9e73eeeb9a0f918ca8","diff":"276144981231","shares":"117685805937","height":2941253,"valid":true,"unlocked":false,"pool_type":"pplns","value":"606222620000","finder":"Being Implemented"},
{"ts":"1690751133908","hash":"c9ddfeaca089b0efb60c12e31d3ab983fee6428587be5f6c5c18440904826a41","diff":"275039291850","shares":"142656153521","height":2941251,"valid":true,"unlocked":false,"pool_type":"pplns","value":"622556110000","finder":"Being Implemented"},
{"ts":"1690750864696","hash":"529e0299ae4ad6b49b0931315d7fefad1079f8f0bd1045cb68af6254f95db93c","diff":"275550822972","shares":"67582134634","height":2941250,"valid":true,"unlocked":false,"pool_type":"pplns","value":"605207440000","finder":"Being Implemented"},
{"ts":"1690750738535","hash":"a837cb9717344fd88158eb321c008238342a3deb7d15c16056baa8918df21546","diff":"274927210112","shares":"655131664552","height":2941248,"valid":true,"unlocked":false,"pool_type":"pplns","value":"636230720000","finder":"Being Implemented"},
{"ts":"1690749513171","hash":"9b112c5d863e80097ee54c308b5a3fed18ce1ed41f98701cc49e978fbe905737","diff":"273381825202","shares":"101385249336","height":2941241,"valid":true,"unlocked":false,"pool_type":"pplns","value":"608888160000","finder":"Being Implemented"},
{"ts":"1690749323534","hash":"fdaee590ebc3ecbcd82aa82f940cd45315cc512386967dde0d08e25e64d3b275","diff":"274009959829","shares":"198925778183","height":2941239,"valid":true,"unlocked":false,"pool_type":"pplns","value":"600447780000","finder":"Being Implemented"},
{"ts":"1690748949063","hash":"eabd27fe1177f45d953868aaca642a07d2119f61c17734764a96671f90b7a3ac","diff":"275421085177","shares":"178349378683","height":2941232,"valid":true,"unlocked":false,"pool_type":"pplns","value":"602682200000","finder":"Being Implemented"},
{"ts":"1690748613495","hash":"e60028ad06434258ca634d0e16d784662bd1a81bebdeca13a4a9cdb54836a694","diff":"275326384319","shares":"57116071335","height":2941230,"valid":true,"unlocked":false,"pool_type":"pplns","value":"601389510000","finder":"Being Implemented"},
{"ts":"1690748505264","hash":"ced7135f366088f203b110ae6d7f3d49a0e5b52c3c11f6fa9f20e7e58968e9c9","diff":"275881815597","shares":"703358935598","height":2941228,"valid":true,"unlocked":false,"pool_type":"pplns","value":"623140980000","finder":"Being Implemented"},
{"ts":"1690747180223","hash":"2f3eb7372929006554ed6a29c5e7f8e6667e401cb31e807b47ba7a873d37ad76","diff":"277475379177","shares":"578386971643","height":2941217,"valid":true,"unlocked":false,"pool_type":"pplns","value":"605400500000","finder":"Being Implemented"},
{"ts":"1690746070947","hash":"e9f5f25e7153229f8d15ad62351e0872332cca6d85c894e5a2acbc1cc0dac38b","diff":"275502772153","shares":"208779978576","height":2941208,"valid":true,"unlocked":false,"pool_type":"pplns","value":"606068000000","finder":"Being Implemented"}]
*/