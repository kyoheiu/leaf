import { Route, Routes } from "@solidjs/router";
import { Component, createEffect, createSignal, Match, Switch } from "solid-js";
import { HopeProvider } from "@hope-ui/solid";

import styles from "./App.module.css";
import Reading from "./Reading";
import Lists from "./Lists";
import { State } from "./Types";
import { Tag } from "./Tag";
import { Search } from "./Search";
import { Header } from "./Header";

export const [state, setState] = createSignal(State.Top);
createEffect(() => console.log(state().toString()), state());

const App: Component = () => {
  return (
    <HopeProvider>
      <Header />
      <Routes>
        <Route path="/" component={Lists} />
        <Route path="/tag/:name" component={Tag} />
        <Route path="/s" component={Search} />
        <Route path="/r/:id" component={Reading} />
      </Routes>
    </HopeProvider>
  );
};

export default App;
