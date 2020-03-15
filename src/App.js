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
      <Route
        exact
        path="/"
        render={props => {
          return (
            <div className="App" id="home">
              <Navbar {...props} />
              <Home />
              <Footer />
            </div>
          );
        }}
      />
      ;
      <Route
        path="/contact"
        render={props => {
          return (
            <>
              <Navbar {...props} />
              <Contact />
            </>
          );
        }}
      />
    </Switch>
  );
}

export default App;
