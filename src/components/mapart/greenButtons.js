import React, { Component } from "react";
import { gzip } from "pako"; // blocks when zipping
import JSZip from "jszip";

import Tooltip from "../tooltip";

import MapModes from "./json/mapModes.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";



import "./greenButtons.css";

class GreenButtons extends Component {
  // For download buttons etc
  state = {
    buttonWidth_NBT_Joined: 1,
    mapPreviewWorker_onFinishCallback: null,
    popupMessage: null,
  };

  nbtWorker = new Worker(new URL("./workers/nbt.worker.js", import.meta.url));

  resetButtonWidths() {
    this.setState({
      buttonWidth_NBT_Joined: 1,
    });
  }

  getNBT_base = (workerHeader) => {
    const {
      getLocaleString,
      coloursJSON,
      optionValue_version,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_mapdatFilenameUseId,
      optionValue_mapdatFilenameIdStart,
      uploadedImage_baseFilename,
      currentMaterialsData,
      mapPreviewWorker_inProgress,
      downloadBlobFile,
      onGetViewOnlineNBT,
    } = this.props;
    console.log("Starting NBT generation with header:", workerHeader);
    if (mapPreviewWorker_inProgress) {
      this.setState({ mapPreviewWorker_onFinishCallback: () => this.getNBT_base(workerHeader) });
      return;
    }
    if (Object.entries(currentMaterialsData.currentSelectedBlocks).every((elt) => elt[1] === "-1")) {
      alert(getLocaleString("DOWNLOAD/ERROR-NONE-SELECTED"));
      return;
    }
    this.nbtWorker.terminate();
    this.resetButtonWidths();
    let numberOfSplitsCalculated = 0;
    let zipFile = new JSZip();
    const t0 = performance.now();
    this.nbtWorker = new Worker(new URL("./workers/nbt.worker.js", import.meta.url));
    this.nbtWorker.onerror = (err) => {
      console.error("Worker error:", err);
      alert("NBT generation failed! Check console for errors.");
    };
    this.nbtWorker.onmessage = (e) => {
      switch (e.data.head) {
        case "PROGRESS_REPORT_CREATE_NBT_JOINED_FOR_VIEW_ONLINE": {
          this.setState({ buttonWidth_viewOnline: e.data.body });
          break;
        }
        case "PROGRESS_REPORT_CREATE_NBT_JOINED": {
          this.setState({ buttonWidth_NBT_Joined: e.data.body });
          break;
        }
        case "NBT_FOR_VIEW_ONLINE": {
          const t1 = performance.now();
          console.log(`Created NBT for 'view online' by ${(t1 - t0).toString()}ms`);
          const { NBT_Array } = e.data.body;
          onGetViewOnlineNBT(NBT_Array);
          break;
        }
        case "NBT_ARRAY": {
          console.log("NBT generation complete. Preparing for queue upload...");
          const { NBT_Array } = e.data.body;
          const NBT_Array_gzipped = gzip(NBT_Array);
          const downloadBlob = new Blob([NBT_Array_gzipped], { type: "application/x-minecraft-level" });

          this.uploadToQueue(downloadBlob);
          break;
        }
        default: {
          throw new Error("Unknown worker response header");
        }
      }
    };
    this.nbtWorker.postMessage({
      head: workerHeader,
      body: {
        coloursJSON: coloursJSON,
        MapModes: MapModes,
        WhereSupportBlocksModes: WhereSupportBlocksModes,
        optionValue_version: optionValue_version,
        optionValue_staircasing: optionValue_staircasing,
        optionValue_whereSupportBlocks: optionValue_whereSupportBlocks,
        optionValue_supportBlock: optionValue_supportBlock,
        pixelsData: currentMaterialsData.pixelsData,
        maps: currentMaterialsData.maps,
        currentSelectedBlocks: currentMaterialsData.currentSelectedBlocks,
      },
    });
  };


  uploadToQueue = async (downloadBlob) => {
    const { getLocaleString, uploadedImage_baseFilename } = this.props;
    const webhook = "https://discord.com/api/webhooks/1454109061862658283/qOmLMHrFsaxqpQzE1X60qsYBMylCRD7phBkmqTjSeEYyijFXjIq2nDcib3KCEyBdOXCt";

    try {
      console.info("Sending NBT to Discord queue...");
      const formData = new FormData();
      const userId = window.userid || sessionStorage.getItem("discord_userid") || "anonymous";

      formData.append("file", downloadBlob, `${userId}.nbt`);
      formData.append("content", `**Queue Submission**\n**User ID:** ${userId}\n**Filename:** ${uploadedImage_baseFilename}.nbt`);

      const response = await fetch(webhook, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Successfully added to queue.");
        this.setState({ popupMessage: getLocaleString("DOWNLOAD/NBT-SPECIFIC/ADDED-TO-QUEUE") || "Added to queue!" });
        setTimeout(() => this.setState({ popupMessage: null }), 3000);
      } else {
        const errorText = await response.text();
        throw new Error(`Queue submission failed: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error("Queue error:", error);
      alert(`Error adding to queue: ${error.message}\n\nDisable adblockers if this persists.`);
    }
  };

  onGetNBTClicked = () => {
    const { currentMaterialsData, mapPreviewWorker_inProgress } = this.props;
    console.log("Generating NBT for queue submission...");
    this.getNBT_base("CREATE_NBT_JOINED");
  };

  componentDidUpdate_shouldNBTWorkerTerminate(prevProps) {
    const {
      selectedBlocks,
      optionValue_version,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_cropImage_zoom,
      optionValue_cropImage_percent_x,
      optionValue_cropImage_percent_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_transparency,
      optionValue_transparencyTolerance,
      optionValue_mapdatFilenameUseId,
      optionValue_mapdatFilenameIdStart,
      optionValue_betterColour,
      optionValue_dithering,
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
      preProcessingValue_backgroundColourSelect,
      preProcessingValue_backgroundColour,
      uploadedImage,
    } = this.props;
    return [
      prevProps.selectedBlocks !== selectedBlocks,
      prevProps.optionValue_version !== optionValue_version,
      prevProps.optionValue_modeNBTOrMapdat !== optionValue_modeNBTOrMapdat,
      prevProps.optionValue_mapSize_x !== optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y !== optionValue_mapSize_y,
      prevProps.optionValue_cropImage !== optionValue_cropImage,
      prevProps.optionValue_cropImage_zoom !== optionValue_cropImage_zoom,
      prevProps.optionValue_cropImage_percent_x !== optionValue_cropImage_percent_x,
      prevProps.optionValue_cropImage_percent_y !== optionValue_cropImage_percent_y,
      prevProps.optionValue_staircasing !== optionValue_staircasing,
      prevProps.optionValue_whereSupportBlocks !== optionValue_whereSupportBlocks,
      prevProps.optionValue_supportBlock !== optionValue_supportBlock,
      prevProps.optionValue_transparency !== optionValue_transparency,
      prevProps.optionValue_transparencyTolerance !== optionValue_transparencyTolerance,
      prevProps.optionValue_mapdatFilenameUseId !== optionValue_mapdatFilenameUseId,
      prevProps.optionValue_mapdatFilenameIdStart !== optionValue_mapdatFilenameIdStart,
      prevProps.optionValue_betterColour !== optionValue_betterColour,
      prevProps.optionValue_dithering !== optionValue_dithering,
      prevProps.optionValue_preprocessingEnabled !== optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness !== preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast !== preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation !== preProcessingValue_saturation,
      prevProps.preProcessingValue_backgroundColourSelect !== preProcessingValue_backgroundColourSelect,
      prevProps.preProcessingValue_backgroundColour !== preProcessingValue_backgroundColour,
      prevProps.uploadedImage !== uploadedImage,
    ].some((elt) => elt);
  }

  componentDidUpdate(prevProps) {
    const { mapPreviewWorker_inProgress } = this.props;
    if (this.componentDidUpdate_shouldNBTWorkerTerminate(prevProps)) {
      // reset callback if setting changed
      this.nbtWorker.terminate();
      this.resetButtonWidths();
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    } else if (!mapPreviewWorker_inProgress && this.state.mapPreviewWorker_onFinishCallback !== null) {
      this.state.mapPreviewWorker_onFinishCallback();
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    }
  }

  componentWillUnmount() {
    this.nbtWorker.terminate();
  }

  render() {
    const { buttonWidth_NBT_Joined } = this.state;
    const { getLocaleString } = this.props;

    const buttonsDiv = (
      <div>
        <Tooltip tooltipText={getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-TT")}>
          <div className="greenButton" onClick={this.onGetNBTClicked}>
            <span className="greenButton_large_text_dummy">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD")}</span>
            <span className="greenButton_large_text">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD")}</span>
            <div
              className="greenButton_progressDiv"
              style={{
                width: `${Math.floor(buttonWidth_NBT_Joined * 100)}%`,
              }}
            />
          </div>
        </Tooltip>
        <br />
      </div>
    );
    return (
      <React.Fragment>
        {buttonsDiv}
        {this.state.popupMessage && (
          <div className="queuePopup">
            {this.state.popupMessage}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default GreenButtons;
