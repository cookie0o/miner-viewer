// Check if address is set
const StorageXMR_address = localStorage.getItem("moneroXMR_address");
if (StorageXMR_address === null) {
  window.open("./settingsPage/settingsPage.html", "_self");
  console.log("XMR XMR_address check failed: " + JSON.stringify(StorageXMR_address));
}