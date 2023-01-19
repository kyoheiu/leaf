import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Header from "./Header";
import Lists from "./List";
function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Lists />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
