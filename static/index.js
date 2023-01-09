const fetch_add = () => {
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
    window.location.reload();
  });
};

const fetch_delete = (e) => {
  const target = "/d/" + e.value;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot add new article.");
    }
    console.log(response.status);
    window.location.reload();
  });
};
