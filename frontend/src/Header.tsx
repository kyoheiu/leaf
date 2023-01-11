import type { Component } from "solid-js";

const Header: Component = () => {
  return (
    <div class="header">
      <script defer type="text/javascript" src="/static/index.js"></script>

      <div id="acidpaper">acidpaper</div>
      <form action="" method="post" id="add">
        <div>
          <input type="url" id="url" />
          <button type="button">add</button>
        </div>
      </form>
    </div>
  );
};

export default Header;
