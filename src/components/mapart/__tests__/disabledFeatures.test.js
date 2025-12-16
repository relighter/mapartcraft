import React from 'react';
import { render, screen } from '@testing-library/react';
import MapSettings from '../mapSettings';
import BlockSelection from '../blockSelection';
import GreenButtons from '../greenButtons';
import MapModes from '../json/mapModes.json';
import SupportedVersions from '../json/supportedVersions.json';

// Mock Worker
class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => { };
  }
  postMessage(msg) {
    this.onmessage({ data: msg });
  }
  terminate() { }
}
window.Worker = MockWorker;
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

// Mock CSS
jest.mock('../mapSettings.css', () => ({}));
jest.mock('../blockSelection.css', () => ({}));
jest.mock('../greenButtons.css', () => ({}));

// Mock libraries
jest.mock('pako', () => ({ gzip: jest.fn() }));
jest.mock('jszip', () => jest.fn());

// Mock child components
jest.mock('../blockImage', () => (props) => <div data-testid="block-image">{props.blockId}</div>);

jest.mock('../bufferedNumberInput/bufferedNumberInput', () => (props) => <input {...props} />);
jest.mock('../autoCompleteInputBlockToAdd/autoCompleteInputBlockToAdd', () => () => <div>AutoCompleteInputBlockToAdd</div>);

// Mock props
const mockGetLocaleString = (key) => key;
const mockColoursJSON = {
  "0": {
    "blocks": {
      "0": {
        "displayName": "White Carpet",
        "validVersions": { "1.16": {} },
        "presetIndex": "0"
      },
      "1": {
        "displayName": "Stone",
        "validVersions": { "1.16": {} },
        "presetIndex": "1"
      }
    },
    "tonesRGB": { "normal": [255, 255, 255] }
  }
};
const mockOptionValueVersion = { MCVersion: "1.16" };

describe('Disabled Features', () => {
  test('MapSettings should not render disabled options', () => {
    render(
      <MapSettings
        getLocaleString={mockGetLocaleString}
        coloursJSON={mockColoursJSON}
        optionValue_version={mockOptionValueVersion}
        optionValue_modeNBTOrMapdat={MapModes.SCHEMATIC_NBT.uniqueId}
        optionValue_mapSize_x={1}
        optionValue_mapSize_y={1}
        optionValue_staircasing={null}
        optionValue_whereSupportBlocks={0}
        optionValue_supportBlock={"white_carpet"}
        // ... other required props with dummy values
        optionValue_cropImage={0}
        optionValue_cropImage_zoom={10}
        optionValue_cropImage_percent_x={50}
        optionValue_cropImage_percent_y={50}
        optionValue_showGridOverlay={false}
        optionValue_transparency={false}
        optionValue_transparencyTolerance={128}
        optionValue_mapdatFilenameUseId={true}
        optionValue_mapdatFilenameIdStart={0}
        optionValue_betterColour={true}
        optionValue_dithering={0}
        optionValue_preprocessingEnabled={false}
        preProcessingValue_brightness={100}
        preProcessingValue_contrast={100}
        preProcessingValue_saturation={100}
        preProcessingValue_backgroundColourSelect={0}
        preProcessingValue_backgroundColour={"#000000"}
        optionValue_extras_moreStaircasingOptions={false}
      />
    );

    expect(screen.queryByText('MAP-SETTINGS/MAP-SIZE:')).toBeNull();
    expect(screen.queryByText('MAP-SETTINGS/GRID-OVERLAY:')).toBeNull();
    expect(screen.queryByText('MAP-SETTINGS/3D/TITLE:')).toBeNull();
    expect(screen.queryByText('MAP-SETTINGS/EXTRAS/TITLE')).toBeNull();
    expect(screen.queryByText('MAP-SETTINGS/NBT-SPECIFIC/WHERE-SUPPORT-BLOCKS/TITLE:')).toBeNull();
  });

  test('BlockSelection should only show carpets and no presets', () => {
    render(
      <BlockSelection
        getLocaleString={mockGetLocaleString}
        coloursJSON={mockColoursJSON}
        optionValue_version={mockOptionValueVersion}
        selectedBlocks={{ "0": "-1" }}
        optionValue_staircasing={null}
        presets={[]}
        selectedPresetName={"None"}
        canDeletePreset={() => false}
      // ... other props
      />
    );

    expect(screen.queryByText('BLOCK-SELECTION/PRESETS/TITLE:')).toBeNull();
    expect(screen.queryByText('White Carpet')).not.toBeNull();
    expect(screen.queryByText('Stone')).toBeNull();
  });

  test('BlockSelection should handle null staircasing without crashing', () => {
    render(
      <BlockSelection
        getLocaleString={mockGetLocaleString}
        coloursJSON={mockColoursJSON}
        optionValue_version={mockOptionValueVersion}
        optionValue_staircasing={null}
        selectedBlocks={{ "0": "-1" }}
        presets={[]}
        selectedPresetName={"None"}
        canDeletePreset={() => false}
      />
    );
    expect(screen.queryByText('White Carpet')).not.toBeNull();
  });

  test('GreenButtons should not show View Online button', () => {
    render(
      <GreenButtons
        getLocaleString={mockGetLocaleString}
        optionValue_modeNBTOrMapdat={MapModes.SCHEMATIC_NBT.uniqueId}
      // ... other props
      />
    );

    expect(screen.queryByText('VIEW-ONLINE/TITLE')).toBeNull();
  });
});
