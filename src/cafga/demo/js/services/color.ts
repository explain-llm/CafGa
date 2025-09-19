import { ColourPalette } from '../datatypes/settings';
import { getSettings } from './settings';
export const colors = {
    black: '#000000',
    white: '#FFFFFF',
    'ghost-white': '#FCFCFC',
    'light-blue': '#B3D7FF',
    'sat-light-blue': '#9A82EF',
    blue: '#007BFF',
    'dark-blue': '#0056b3',
    'light-gray': '#E9ECEF',
    gray: '#ADB5BD',
    'dark-gray': '#495057',
    'accented-gray': '#6C757D',
    'light-green': '#7cf2ad',
    green: '#28A745',
    'dark-green': '#1c8045',
    yellow: '#FFC107',
    red: '#DC3545',
    purple: '#7D0DC3',
    'dark-yellow': '#d0ca11',
};
export function getHighlightColour(fixed:boolean): string {
    let setting = getSettings();
    let palette = setting.colourPalette;
    if (fixed) {
        return 'hsla(188 78% 50% / 0.7)';
    }
    switch (palette) {
        case ColourPalette.RB:
            // Red-Blue style based on the SHAP library
            // return "rgba(27,158,119,0.9)"
            return "rgba(240, 232, 95, 0.8)";
        case ColourPalette.GB:
            return 'hsla(188 78% 50% / 0.7)';
        default:
            throw new Error('Unknown ColourStyle: ' + palette);
    }
}
export function getAttributionColour(value: number): string {
    let setting = getSettings();
    let palette = setting.colourPalette;
    switch (palette) {
        case ColourPalette.RB:
            // Red-Blue style based on the SHAP library
            return value > 0 ? `hsl(341, 100%, ${100 - value * 50}%)`: `hsl(207, 100%, ${100 + value * 50}%)`;
        case ColourPalette.GB:
            return value > 0 ? `hsl(120, 100%, ${100 - value * 50}%)`: `hsl(240, 100%, ${100 + value * 50}%)`;
        default:
            throw new Error('Unknown ColourStyle: ' + palette);
    }
}

export const sampleColorTable = [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
    '#5778a4',
    '#e49444',
    '#d1615d',
    '#85b6b2',
    '#6a9f58',
    '#e7ca60',
    '#a87c9f',
    '#f1a2a9',
    '#967662',
    '#b8b0ac',
];