const getScrollPosition = () => {
  const bodyheight = document.documentElement.scrollHeight;
  console.log('bodyheight: ' + bodyheight);
  const scrolled = document.documentElement.scrollTop;
  console.log('scrolled: ' + scrolled);
  if (scrolled === 0) {
    return 0;
  } else {
    return Math.round(scrolled * 100 / bodyheight);
  }
};

window.addEventListener("scroll", (event) => {
  const url = location.href;
  const id = url.split("/").pop();

  const pos = getScrollPosition();
  console.log('pos:' + pos);
  const target = "../u?id=" + id + "&pos=" + pos;
  fetch(target).then((response) => {
    if (!response.ok) {
      throw new Error("Cannot update scroll position.");
    }
    console.log(response.status);
  });
});
