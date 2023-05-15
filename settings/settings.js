if (localStorage.getItem("monerokey") !== null) {$("input#xmraddress").val(localStorage.getItem("monerokey"))}


$("input#xmraddress").on("change input", function() {localStorage.setItem("monerokey", $(this).val())});