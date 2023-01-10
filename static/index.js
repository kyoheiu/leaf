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
    add_element("test");
  });
};

const fetch_delete = (e) => {
  const target = "/d/" + e.value;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot add new article.");
    }
    console.log(response.status);
    console.log(e.value);
    remove_element(e.value);
  });
};

const add_element = (id) => {
  console.log(id);
  window.location.reload();
};

const remove_element = (id) => {
  const child = document.getElementById(id);
  Element.innerHTML = "";
};

document.addEventListener("DOMContentLoaded", function (event) {
  var scrollpos = localStorage.getItem("scrollpos");
  if (scrollpos) window.scrollTo(0, scrollpos);
});

window.onbeforeunload = function (e) {
  localStorage.setItem("scrollpos", window.scrollY);
};
