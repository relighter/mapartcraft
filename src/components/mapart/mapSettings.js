import React, { Component } from "react";



import BufferedNumberInput from "./bufferedNumberInput/bufferedNumberInput";

import Tooltip from "../tooltip";

import BackgroundColourModes from "./json/backgroundColourModes.json";
import DitherMethods from "./json/ditherMethods.json";
import MapModes from "./json/mapModes.json";
import SupportedVersions from "./json/supportedVersions.json";

import "./mapSettings.css";

class MapSettings extends Component {
  render() {
    const {
      getLocaleString,
      optionValue_betterColour,
      onOptionChange_BetterColour,
      optionValue_dithering,
      onOptionChange_dithering,
      optionValue_preprocessingEnabled,
      onOptionChange_PreProcessingEnabled,
      preProcessingValue_brightness,
      onOptionChange_PreProcessingBrightness,
      preProcessingValue_contrast,
      onOptionChange_PreProcessingContrast,
      preProcessingValue_saturation,
      onOptionChange_PreProcessingSaturation,
      preProcessingValue_backgroundColourSelect,
      onOptionChange_PreProcessingBackgroundColourSelect,
      preProcessingValue_backgroundColour,
      onOptionChange_PreProcessingBackgroundColour,
    } = this.props;

    const setting_betterColour = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/BETTER-COLOUR-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/BETTER-COLOUR")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_betterColour} onChange={onOptionChange_BetterColour} />
        <br />
      </React.Fragment>
    );
    const setting_dithering = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/DITHERING/TITLE-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/DITHERING/TITLE")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select value={optionValue_dithering} onChange={onOptionChange_dithering}>
          {Object.keys(DitherMethods).map((ditherMethodKey) => (
            <option key={DitherMethods[ditherMethodKey]["uniqueId"]} value={DitherMethods[ditherMethodKey]["uniqueId"]}>
              {"localeKey" in DitherMethods[ditherMethodKey]
                ? getLocaleString(DitherMethods[ditherMethodKey]["localeKey"])
                : DitherMethods[ditherMethodKey]["name"]}
            </option>
          ))}
        </select>
        <br />
      </React.Fragment>
    );
    const setting_preprocessing = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/ENABLE")}
            {":"}
          </b>{" "}
          <input type="checkbox" checked={optionValue_preprocessingEnabled} onChange={onOptionChange_PreProcessingEnabled} />
        </th>
        <td />
        <td />
      </tr>
    );
    const setting_preprocessing_brightness = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/BRIGHTNESS")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input
            type="range"
            min="0"
            max="200"
            value={preProcessingValue_brightness}
            onChange={(e) => onOptionChange_PreProcessingBrightness(parseInt(e.target.value))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_brightness}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingBrightness}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_contrast = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/CONTRAST")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input
            type="range"
            min="0"
            max="200"
            value={preProcessingValue_contrast}
            onChange={(e) => onOptionChange_PreProcessingContrast(parseInt(parseInt(e.target.value)))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_contrast}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingContrast}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_saturation = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/SATURATION")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input
            type="range"
            min="0"
            max="200"
            value={preProcessingValue_saturation}
            onChange={(e) => onOptionChange_PreProcessingSaturation(parseInt(e.target.value))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_saturation}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingSaturation}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_background = (
      <tr>
        <th>
          <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND/TITLE-TT")}>
            <b>
              {getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND/TITLE")}
              {":"}
            </b>
          </Tooltip>{" "}
        </th>
        <td>
          <select
            onChange={onOptionChange_PreProcessingBackgroundColourSelect}
            value={preProcessingValue_backgroundColourSelect}
            disabled={!optionValue_preprocessingEnabled}
          >
            {Object.values(BackgroundColourModes).map((backgroundColourMode) => (
              <option key={backgroundColourMode.uniqueId} value={backgroundColourMode.uniqueId}>
                {getLocaleString(backgroundColourMode.localeKey)}
              </option>
            ))}
          </select>
        </td>
      </tr>
    );
    const setting_preprocessing_backgroundColour = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND-COLOUR")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input
            type="color"
            value={preProcessingValue_backgroundColour}
            onChange={onOptionChange_PreProcessingBackgroundColour}
            disabled={!optionValue_preprocessingEnabled || preProcessingValue_backgroundColourSelect === BackgroundColourModes.OFF.uniqueId}
          />
        </td>
      </tr>
    );
    const settingGroup_preprocessing = (
      <React.Fragment>
        <details>
          <summary>{getLocaleString("MAP-SETTINGS/PREPROCESSING/TITLE")}</summary>
          <div className={optionValue_preprocessingEnabled ? "settingsGroup" : null}>
            <table>
              <tbody>
                {setting_preprocessing}
                {setting_preprocessing_brightness}
                {setting_preprocessing_contrast}
                {setting_preprocessing_saturation}
                {setting_preprocessing_background}
                {setting_preprocessing_backgroundColour}
              </tbody>
            </table>
          </div>
        </details>
      </React.Fragment>
    );
    const settingsDiv = (
      <div className="section settingsDiv">
        <h2>{getLocaleString("MAP-SETTINGS/TITLE")}</h2>
        {setting_betterColour}
        {setting_dithering}
        {settingGroup_preprocessing}
      </div>
    );
    return settingsDiv;
  }
}

export default MapSettings;
