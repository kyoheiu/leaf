import type { Component } from "solid-js";

import styles from "./App.module.css";
import Header from "./Header";
import Lists from "./Lists";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Header />
      <Lists />
    </div>
  );
};

export default App;
