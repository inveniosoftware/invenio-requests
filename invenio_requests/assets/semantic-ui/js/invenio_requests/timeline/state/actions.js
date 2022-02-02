
export const IS_LOADING = 'timeline/IS_LOADING';
export const SUCCESS = 'timeline/SUCCESS';
export const HAS_ERROR = 'timeline/HAS_ERROR';

export const fetchTimeline = () => {
  return async (dispatch, getState, config) => {
    dispatch({
      type: IS_LOADING,
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
