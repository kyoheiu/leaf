const ok = () => {
    console.log("ok");
}

const err = () => {
    console.error("error");
}

function saveOptions(e) {
    browser.storage.local.set({
      hmstrBase: document.querySelector("#hmstrBase").value
    }).then(ok(), err());
    browser.storage.local.set({
      hmstrToken: document.querySelector("#hmstrToken").value
    }).then(ok(), err());
    e.preventDefault();
  }
  
  function restoreOptions() {
    let storageItem = browser.storage.local.get('hmstrBase');
    storageItem.then((res) => {
      document.querySelector("#managed-base").innerText = res.hmstrBase;
    });
  }
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);