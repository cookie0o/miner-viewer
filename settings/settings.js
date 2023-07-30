// Save XMR address
if (localStorage.getItem("monerokey") !== null) {$("input#xmraddress").val(localStorage.getItem("monerokey"))}

$("input#xmraddress").on("change input", function() {localStorage.setItem("monerokey", $(this).val())});

// Save Currency Code
if (localStorage.getItem("Currency") !== null) {$("#currencySelect").val(localStorage.getItem("Currency"));}

$("#currencySelect").on("change", function() {localStorage.setItem("Currency", $(this).val());});