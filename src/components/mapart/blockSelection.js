import React, { Component } from "react";

import Tooltip from "../tooltip";

import BlockImage from "./blockImage";

import MapModes from "./json/mapModes.json";
import SupportedVersions from "./json/supportedVersions.json";

import "./blockSelection.css";

class BlockSelection extends Component {
  state = {};

  cssRGB(RGBArray) {
    // RGB array to css compatible string
    return `rgb(${RGBArray.join(", ")})`;
  }

  getColourSetBox = (colourSet) => {
    const { optionValue_staircasing } = this.props;
    let background;
    switch (optionValue_staircasing) {
      case null:
      case MapModes.SCHEMATIC_NBT.staircaseModes.OFF.uniqueId:
      case MapModes.MAPDAT.staircaseModes.OFF.uniqueId: {
        background = this.cssRGB(colourSet.tonesRGB.normal);
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.CLASSIC.uniqueId:
      case MapModes.SCHEMATIC_NBT.staircaseModes.VALLEY.uniqueId:
      case MapModes.MAPDAT.staircaseModes.ON.uniqueId: {
        background = `linear-gradient(${this.cssRGB(colourSet.tonesRGB.dark)} 33%, ${this.cssRGB(colourSet.tonesRGB.normal)} 33%, ${this.cssRGB(
          colourSet.tonesRGB.normal
        )} 66%, ${this.cssRGB(colourSet.tonesRGB.light)} 66%)`;
        break;
      }
      case MapModes.MAPDAT.staircaseModes.ON_UNOBTAINABLE.uniqueId: {
        background = `linear-gradient(${this.cssRGB(colourSet.tonesRGB.unobtainable)} 25%, ${this.cssRGB(colourSet.tonesRGB.dark)} 25%, ${this.cssRGB(
          colourSet.tonesRGB.dark
        )} 50%, ${this.cssRGB(colourSet.tonesRGB.normal)} 50%, ${this.cssRGB(colourSet.tonesRGB.normal)} 75%, ${this.cssRGB(colourSet.tonesRGB.light)} 75%)`;
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_DARK.uniqueId:
      case MapModes.MAPDAT.staircaseModes.FULL_DARK.uniqueId: {
        background = this.cssRGB(colourSet.tonesRGB.dark);
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_LIGHT.uniqueId:
      case MapModes.MAPDAT.staircaseModes.FULL_LIGHT.uniqueId: {
        background = this.cssRGB(colourSet.tonesRGB.light);
        break;
      }
      case MapModes.MAPDAT.staircaseModes.FULL_UNOBTAINABLE.uniqueId: {
        background = this.cssRGB(colourSet.tonesRGB.unobtainable);
        break;
      }
      default: {
        throw new Error("Unknown staircasing value");
      }
    }
    return (
      <div
        className="colourSetBox"
        style={{
          background: background,
        }}
      />
    );
  };

  render() {
    const {
      coloursJSON,
      getLocaleString,
      onChangeColourSetBlock,
      optionValue_version,
      selectedBlocks,
    } = this.props;

    const blockSelection = (
      <React.Fragment>
        {Object.entries(coloursJSON)
          .filter(([, colourSet]) => Object.values(colourSet.blocks).some((block) => Object.keys(block.validVersions).includes(optionValue_version.MCVersion) && block.displayName.includes("Carpet")))
          .map(([colourSetId, colourSet]) => (
            <div key={colourSetId} className="colourSet">
              {this.getColourSetBox(colourSet)}
              <label>
                <Tooltip tooltipText={getLocaleString("NONE")}>
                  <BlockImage
                    getLocaleString={getLocaleString}
                    coloursJSON={coloursJSON}
                    colourSetId={colourSetId}
                    blockId={"-1"}
                    onClick={() => onChangeColourSetBlock(colourSetId, "-1")}
                    style={{
                      cursor: "pointer",
                      ...(selectedBlocks[colourSetId] === "-1" && {
                        filter: "drop-shadow(0 0 4px #658968)",
                        backgroundColor: "#658968",
                      }),
                    }}
                  />
                </Tooltip>
              </label>
              <div className={"colourSetBlocks"}>
                {Object.entries(colourSet.blocks)
                  .filter(([, block]) => Object.keys(block.validVersions).includes(optionValue_version.MCVersion) && block.displayName.includes("Carpet"))
                  .map(([blockId, block]) => (
                    <label key={blockId}>
                      <Tooltip tooltipText={block.displayName}>
                        {selectedBlocks[colourSetId] === blockId &&
                          !(Object.values(SupportedVersions)[Object.keys(SupportedVersions).length - 1].MCVersion in block.validVersions) && (
                            // if doesn't support latest version
                            <div
                              style={{
                                position: "absolute",
                                paddingLeft: "28px",
                                zIndex: 110,
                              }}
                            >
                              <Tooltip
                                tooltipText={`${getLocaleString("BLOCK-SELECTION/UNSUPPORTED-PAST")} ${Object.keys(block.validVersions)[Object.keys(block.validVersions).length - 1]
                                  }`}
                                textStyleOverrides={{
                                  whiteSpace: "nowrap",
                                  backgroundColor: "red",
                                }}
                              >
                                <h2 style={{ backgroundColor: "red", margin: "0" }}>{"!"}</h2>
                              </Tooltip>
                            </div>
                          )}
                        <BlockImage
                          coloursJSON={coloursJSON}
                          colourSetId={colourSetId}
                          blockId={blockId}
                          onClick={() => {
                            onChangeColourSetBlock(colourSetId, blockId);
                          }}
                          style={{
                            cursor: "pointer",
                            ...(selectedBlocks[colourSetId] === blockId && {
                              filter: "drop-shadow(0 0 4px #658968)",
                              ...(block.presetIndex !== "CUSTOM" && {
                                backgroundColor: "#658968",
                              }),
                            }),
                          }}
                        />
                      </Tooltip>
                    </label>
                  ))}
              </div>
            </div>
          ))}
      </React.Fragment>
    );
    return (
      <div className="section blockSelectionDiv">
        {blockSelection}
      </div>
    );
  }
}

export default BlockSelection;
