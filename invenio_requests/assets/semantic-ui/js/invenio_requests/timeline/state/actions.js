export const IS_LOADING = "timeline/IS_LOADING";
export const SUCCESS = "timeline/SUCCESS";
export const HAS_ERROR = "timeline/HAS_ERROR";
export const IS_REFRESHING = "timeline/REFRESHING";

export const fetchTimeline = (loadingState = true) => {
  return async (dispatch, getState, config) => {
    if (loadingState) {
      dispatch({
        type: IS_LOADING,
      });
    }
    dispatch({
      type: IS_REFRESHING,
    });
    try {
      const response = await config.apiClient.getTimeline();
      dispatch({
        type: SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: HAS_ERROR,
        payload: error,
      });
    }
  };
};

export const setRefreshInterval = () => {
  return (dispatch, getState, config) => {
    return config.refreshIntervalMs;
  };
};
