window.addEventListener("pageshow", (event) => {
  console.log("Checking history...");
  if (window.performance.getEntries()[0].type === "back_forward") {
    location.reload(true);
    console.log("Reloaded.");
  }
});
