import { Route, Routes } from "@solidjs/router";
import { Component, createSignal, Match, Switch } from "solid-js";

import styles from "./App.module.css";
import Reading from "./Article";
import Header from "./Header";
import Lists from "./Lists";
import { State } from "./Types";

export const [state, setState] = createSignal(State.List);

const App: Component = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" component={Lists} />
        <Route path="/r/:id" component={Reading} />
      </Routes>
    </>
  );
};

export default App;
