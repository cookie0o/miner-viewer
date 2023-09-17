// Save XMR address
if (localStorage.getItem("moneroXMR_address") !== null) {$("input#xmraddress").val(localStorage.getItem("moneroXMR_address"))}

$("input#xmraddress").on("change input", function() {
  localStorage.setItem("moneroXMR_address", $(this).val());
});

// Save Currency Code
if (localStorage.getItem("currency") !== null) {$("#currencySelect").val(localStorage.getItem("currency"));}

$("#currencySelect").on("change", function() {
  localStorage.setItem("currency", $(this).val());
  // force XMR Price update
  localStorage.setItem("ForcePriceUpdate", true);
});

// donate btn
document.getElementById('donate_btn').addEventListener('click', function() {
  // Redirect to the target URL
  window.location.href = 'https://github.com/cookie0o/cookie0o/blob/main/.github/FUNDING.md';
});



// populate the ComboBox on page load
import {
  currencyCodes
} from '../shared/js/lists.js';

const currencySelect = document.getElementById("currencySelect");
function populateComboBox() {
  for (const code of currencyCodes) {
    const option = document.createElement("option");
    option.text = code;
    option.value = code;
    currencySelect.appendChild(option);
  }
  // if no currency is set refer to default: EUR
  if (localStorage.getItem("currency") == null) {
    localStorage.setItem("currency", "Euro (EUR)");
  }
}
// run function when window is loaded
window.onload = populateComboBox();