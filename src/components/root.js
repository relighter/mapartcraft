import React, { Component } from "react";

import Header from "./header";
import MapartController from "./mapart/mapartController";

import Locale from "../locale/locale";

import "./root.css";

class Root extends Component {
  state = {
    displayingCorruptedPresetWarning: false,
    displayingEdgeWarning: false,
  };

  constructor(props) {
    super(props);

    //show warning when using Edge
    if (!(/*@cc_on!@*/ (false || !!document["documentMode"])) && !!window["StyleMedia"]) {
      this.state.displayingEdgeWarning = true;
    }
  }

  getLocaleString = (stringName, languageCodeOverride) => {
    // Always use 'en'
    const countryCode = "en";
    if (countryCode in Locale) {
      let stringSegments = stringName.split("/");
      const stringLast = stringSegments.pop();
      let folder = Locale[countryCode].strings;
      for (const stringSegment of stringSegments) {
        folder = folder[stringSegment];
      }
      if (folder[stringLast] === null) {
        return this.getLocaleString(stringName, "en");
      } else {
        return folder[stringLast];
      }
    } else {
      return this.getLocaleString(stringName, "en");
    }
  };

  onEdgeWarningButtonClick = () => {
    this.setState({ displayingEdgeWarning: false });
  };

  onCorruptedPresetWarningButtonClick = () => {
    this.setState({ displayingCorruptedPresetWarning: false });
  };

  showCorruptedPresetWarning = () => {
    this.setState({ displayingCorruptedPresetWarning: true });
  };

  render() {
    const { displayingCorruptedPresetWarning, displayingEdgeWarning } = this.state;
    return (
      <React.Fragment>
        <div className="titleAndLanguages">
          <span><h1>MapartCraft</h1></span>
        </div>
        <Header getLocaleString={this.getLocaleString} countryCode={"en"} />
        <MapartController getLocaleString={this.getLocaleString} onCorruptedPreset={this.showCorruptedPresetWarning} />
        <div className="fixedMessages">
          {displayingEdgeWarning ? (
            <div className="fixedMessage">
              <p>{this.getLocaleString("EDGE-WARNING").replace("\\n", "\n")}</p>
              <button type="button" onClick={this.onEdgeWarningButtonClick}>
                ✔️
              </button>
            </div>
          ) : null}
          {displayingCorruptedPresetWarning ? (
            <div className="fixedMessage">
              <p>{this.getLocaleString("BLOCK-SELECTION/PRESETS/IMPORT-ERROR-CORRUPTED")}</p>
              <button type="button" onClick={this.onCorruptedPresetWarningButtonClick}>
                ❗
              </button>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default Root;
