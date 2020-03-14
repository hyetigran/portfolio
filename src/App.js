import React from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";

import Navbar from "./components/Navigation/Navbar";
import Home from "./views/Home";
import Footer from "./components/Footer/Footer";
import Contact from "./components/Contact/Contact";

function App() {
  return (
    <Switch>
      <Route exact path="/">
        <div className="App">
          <Navbar />
          <Home />
          <Footer />
        </div>
      </Route>
      <Route path="/contact">
        <Contact />
      </Route>
    </Switch>
  );
}

export default App;
