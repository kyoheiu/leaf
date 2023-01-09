const form = document.getElementById("add");
form.addEventListener("submit", (event) => {
  const url = document.getElementById("url").value;

  console.log(url);

  fetch("/a", {
    method: "POST",
    body: url,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot add new article.");
    }
    console.log(response.status);
  });
  setTimeout(() => {
    window.location.href = "/";
    console.log("Set to index.");
    window.location.reload();
    console.log("Reloaded.");
  }, 100);
  event.preventDefault();
});
