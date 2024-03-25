// Check if address is set
const StorageXMR_address = localStorage.getItem("moneroXMR_address");
if (StorageXMR_address === null) {
  window.open("./settingsPage/settingsPage.html", "_self");
  console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));
}


// sort by comboBox on change event
const sorting_comboBox = document.getElementById("sorting_comboBox");
sorting_comboBox.addEventListener("change", function() {
    const selectedValue = sorting_comboBox.value;
    // save sorting order in storage
    localStorage.setItem("sortingOrder", selectedValue);
    // reload
    window.location.reload();
});
// change comboBox value to stored value
function sort() {
  let SortingOrder = localStorage.getItem("sortingOrder");
  // default on/off sorting order
  if (SortingOrder == null) {
    SortingOrder = 6
  }
  sorting_comboBox.value = SortingOrder;
}
sort()