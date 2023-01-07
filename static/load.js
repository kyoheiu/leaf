window.addEventListener("load", (event) => {
  const url = location.href;
  const id = url.split("/").pop();
  const target = "../g?id=" + id;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot update scroll position.");
    }
    console.log(response.headers);
    const initial = response.headers.get("Initial-Position");
    const scroll = Math.round(
      (document.documentElement.scrollHeight * initial) / 100
    );
    window.scrollTo(0, scroll);
  });
});
