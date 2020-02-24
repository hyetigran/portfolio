import React from "react";
import "./App.css";

import NavBar from "./components/navbar";
import Home from "./views/home";

function App() {
  return (
    <div className="App">
      <NavBar />
      <Home />
    </div>
  );
}

export default App;
