import React from "react";
import "./App.css";

import Navbar from "./components/Navigation/Navbar";
import Home from "./views/home";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
