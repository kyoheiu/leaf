const getScrollPosition = () => {
  const bodyheight = document.documentElement.scrollHeight;
  console.log("bodyheight: " + bodyheight);
  const scrolled = document.documentElement.scrollTop;
  console.log("scrolled: " + scrolled);
  const client = document.documentElement.clientHeight;
  console.log("client: " + client);

  const pos = Math.round((scrolled * 100) / bodyheight);
  const prog = Math.abs(bodyheight - client - scrolled);
  if (prog < 1) {
    return { pos: pos, prog: 100 };
  } else {
    return { pos: pos, prog: 100 - Math.round((prog * 100) / bodyheight) };
  }
};

window.addEventListener("scroll", (event) => {
  const url = location.href;
  const id = url.split("/").pop();

  const numbers = getScrollPosition();
  console.log("pos: " + numbers.pos + " prog: " + numbers.prog);
  const target =
    "../u?id=" + id + "&pos=" + numbers.pos + "&prog=" + numbers.prog;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot update scroll position.");
    }
    console.log(response.status);
  });
});
