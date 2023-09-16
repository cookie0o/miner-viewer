const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');
const toggleBtn = document.getElementById('sidebar_btn');

// Function to open the sidebar
function openSidebar() {
  sidebar.classList.remove('sidebar-closed');
  sidebar.classList.add('sidebar-open');

  main.style.marginLeft = "290px";
  try {
    var activePools = document.getElementById('active-pools');
    activePools.style.left = "5px";
  } catch {}
}

// Function to close the sidebar
function closeSidebar() {
  sidebar.classList.remove('sidebar-open');
  sidebar.classList.add('sidebar-closed');

  main.style.marginLeft = "0px";
  try {
    var activePools = document.getElementById('active-pools');
    activePools.style.left = "55px";
  } catch {}
}

// Function to toggle the sidebar on button click
function toggleSidebar() {
  if (sidebar.classList.contains('sidebar-open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}
// Event listener to toggle the sidebar on button click
toggleBtn.addEventListener('click', toggleSidebar);

// open sidebar when screen is over 1500px
function handleOpenSidebar(event) {
  if (event.matches) {
    openSidebar();
  }
}
// close sidebar when screen is under 1375px
function handleCloseSidebar(event) {
  if (event.matches) {
    closeSidebar();
  }
}
const mediaQueryOpen = window.matchMedia("(min-width: 1500px)");
handleOpenSidebar(mediaQueryOpen);
mediaQueryOpen.addEventListener("change", handleOpenSidebar);

const mediaQueryClose = window.matchMedia("(max-width: 1375px)");
handleCloseSidebar(mediaQueryClose);
mediaQueryClose.addEventListener("change", handleCloseSidebar);