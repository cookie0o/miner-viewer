// Save XMR address
if (localStorage.getItem("monerokey") !== null) {$("input#xmraddress").val(localStorage.getItem("monerokey"))}

$("input#xmraddress").on("change input", function() {localStorage.setItem("monerokey", $(this).val())});

// Save Currency Code
if (localStorage.getItem("currency") !== null) {$("#currencySelect").val(localStorage.getItem("currency"));}

$("#currencySelect").on("change", function() {
    localStorage.setItem("currency", $(this).val());
    // force XMR Price update
    localStorage.setItem("ForcePriceUpdate", true);
});



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
