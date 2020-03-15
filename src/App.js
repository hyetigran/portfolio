import React from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";

import Navbar from "./components/Navigation/Navbar";
import Home from "./views/Home";
import Footer from "./components/Footer/Footer";
import Contact from "./views/Contact";

function App() {
  return (
    <Switch>
      <Route exact path="/">
        <div className="App" id="home">
          <Navbar />
          <Home />
          <Footer />
        </div>
      </Route>
      <Route path="/contact">
        <Navbar />
        <Contact />
      </Route>
    </Switch>
  );
}

export default App;
