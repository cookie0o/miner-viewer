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


