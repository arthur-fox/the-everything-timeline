/**
 * Day 51: the few globe constants the timeline bundle needs before the globe chunk loads
 * (URL parsing, labels). Everything else globe-related lives behind src/globe-app.js.
 */
export const GLOBE_LAYER_KEYS = ['polities', 'peoples', 'presence'];

/** Schematic polities hand over to the nations layer from this year (Day 41). */
export const NATIONS_START = 1815;

export const NATION_ID_PREFIX = 'nation-';
