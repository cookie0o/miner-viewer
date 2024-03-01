export var StorageKey = localStorage.getItem("monerokey");
if (StorageKey_unchecked.match(/4[0-9AB][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{93}/) == true) {
    var StorageKey = StorageKey_unchecked;
} else {
    alert("XMR address validation failed, it will still be used.");
    var StorageKey = StorageKey_unchecked;
}

export var StorageKey
    
