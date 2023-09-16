// export var StorageKey = localStorage.getItem("monerokey");
export var StorageKey_unchecked = ("888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H")
if (StorageKey_unchecked.match(/4[0-9AB][123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{93}/) == true) {
    var StorageKey = StorageKey_unchecked;
} else {
    alert("XMR address validation failed, it will still be used.");
    var StorageKey = StorageKey_unchecked;
}

export var StorageKey
    
