const addNewOne = (tab) => {
  const gettingItem = browser.storage.local.get(["hmstrBase", "hmstrToken"]);
  gettingItem.then(res => {
    const target = res.hmstrBase + "/api/create";
    console.error(target)
    fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: res.token
      },
      body: JSON.stringify({url: tab.url})
    }).then(res => {
      console.error(res.statusText)
    })
  })
}

console.log("Hi there.");
browser.action.onClicked.addListener((tab) => addNewOne(tab));