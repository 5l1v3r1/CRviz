import { createAction, handleActions } from "redux-actions";

const defaultState = {
  hierarchyConfig: [], // Array of fields to group by.
  shouldShowNodes: true, // Whether to show individual nodes
  darkTheme: false, // Whether to use dark theme
  colorBy: null // The field for which to color the devices/groupings by.
};

// ACTIONS

const setHierarchyConfig = createAction("SET_HIERARCHY_CONFIG");
const setKeyFields = createAction("SET_KEY_FIELDS");
const setIgnoredFields = createAction("SET_IGNORED_FIELDS");
const showNodes = createAction("SHOW_NODES");
const useDarkTheme = createAction("USE_DARK_THEME");
const colorBy = createAction("COLOR_BY");

const reducer = handleActions(
  {
    [setHierarchyConfig]: (state, { payload }) => ({ ...state, hierarchyConfig: payload }),
    [setKeyFields]: (state, { payload }) => { 
      const keyFields = payload;
      return {...state, keyFields: keyFields }
    },
    [setIgnoredFields]: (state, { payload }) => ({ ...state, ignoredFields: payload }),
    [showNodes]: (state, { payload }) => ({ ...state, shouldShowNodes: !!payload }), // Convert payload to boolean for easier debugging
    [useDarkTheme]: (state, { payload }) => ({ ...state, darkTheme: !!payload }), // Convert payload to boolean for easier debugging
    [colorBy]: (state, { payload }) => ({ ...state, colorBy: payload })
  },
  defaultState
);

const selectControls = (state) => state.controls;
const getKeyFields = (state) => state.controls.keyFields || [];
const getIgnoredFields = (state) => state.controls.ignoredFields || [];

export default reducer;
export { setHierarchyConfig, showNodes, colorBy, useDarkTheme, selectControls, setKeyFields, getKeyFields, setIgnoredFields, getIgnoredFields };
