/**
 * Day 51: the globe chunk. src/main.js imports this lazily (the first time the globe is
 * entered, hovered or deep-linked), so the timeline landing downloads none of the globe code
 * or content (overlays, peoples, presence, nations tables, colours, labels, three/globe.gl).
 */
export {
  mountGlobe,
  pauseGlobe,
  destroyGlobe,
  setGlobeOverlayYear,
  setGlobeSelectedEntity,
  setOnGlobePolygonClick,
  setGlobeHiddenLayers,
  setGlobeLabelsEnabled,
  setGlobeCertaintyEnabled,
  setGlobeCitiesEnabled,
  setGlobeEventsEnabled,
  setGlobePinHandlers,
  setGlobeFlowsEnabled,
  setOnGlobeRouteClick,
  getGlobeCameraAt,
  prefetchGlobe,
  getGlobeLoadSteps,
} from './globe-view.js';
export { getOverlayLayerFilter, setOverlayLayerFilter, formatOverlayYear, getSpatialEntityById, getEntityLifespan, getActiveOverlaysAtYear } from './globe-overlays.js';
export {
  getActiveSchematicOverlaysAtYear,
  getActiveNationsAtYear,
  getNationEntityById,
  getNationPeriodAtYear,
  isNationEntityId,
  isNationActiveAtYear,
  nearestNationYear,
} from './globe-nations.js';
