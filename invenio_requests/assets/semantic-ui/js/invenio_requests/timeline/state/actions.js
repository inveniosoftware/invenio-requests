// This file is part of InvenioRequests
// Copyright (C) 2022 CERN.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

export const IS_LOADING = "timeline/IS_LOADING";
export const SUCCESS = "timeline/SUCCESS";
export const HAS_ERROR = "timeline/HAS_ERROR";
export const IS_REFRESHING = "timeline/REFRESHING";
export const CHANGE_PAGE = "timeline/CHANGE_PAGE";
export const MISSING_REQUESTED_EVENT = "timeline/MISSING_REQUESTED_EVENT";
export const APPEND_PAGE = "timeline/APPEND_PAGE";

class intervalManager {
  static IntervalId = undefined;

  static setIntervalId(intervalId) {
    this.intervalId = intervalId;
  }

  static resetInterval() {
    clearInterval(this.intervalId);
    delete this.intervalId;
  }
}

export const appendPage = (newHits, nextPage) => ({
  type: APPEND_PAGE,
  payload: { newHits, nextPage },
});

export const fetchTimeline = (focusEventId = undefined) => {
  return async (dispatch, getState, config) => {
    const { size } = getState().timeline;

    dispatch({ type: IS_REFRESHING });

    try {
      let firstPageResponse = await config.requestsApi.getTimeline({
        size,
        page: 1,
        sort: "oldest",
      });

      const totalHits = firstPageResponse?.data?.hits?.total || 0;
      const lastPageNumber = Math.ceil(totalHits / size);

      let lastPageResponse = null;
      if (lastPageNumber > 1) {
        // Always fetch last page
        lastPageResponse = await config.requestsApi.getTimeline({
          size,
          page: lastPageNumber,
          sort: "oldest",
        });
      }

      if (focusEventId) {
        // Fetch focused event info to know which page it's on
        const focusEventResponse = await config.requestsApi.getTimelineFocused(
          focusEventId,
          {
            size,
          }
        );
        const focusedEventPage = focusEventResponse?.data?.page || 1;

        // Only fetch extra page if focused event is not on first or last page
        if (focusedEventPage > 1 && focusedEventPage < lastPageNumber) {
          const combinedSize = size * focusedEventPage;

          firstPageResponse = await config.requestsApi.getTimeline({
            size: combinedSize,
            page: 1,
            sort: "oldest",
          });
        }

        const allHits = firstPageResponse.data.hits.hits || [];
        const lastHits = lastPageResponse?.data.hits.hits || [];
        const exists =
          allHits.some((h) => h.id === focusEventId) ||
          lastHits.some((h) => h.id === focusEventId);

        if (!exists) {
          dispatch({ type: MISSING_REQUESTED_EVENT });
        }
      }

      dispatch({
        type: SUCCESS,
        payload: {
          firstPage: firstPageResponse.data,
          lastPage: lastPageResponse?.data || null,
        },
      });
    } catch (error) {
      dispatch({
        type: HAS_ERROR,
        payload: error,
      });
    }
  };
};

export const setPage = (page) => {
  return async (dispatch, getState, config) => {
    dispatch({
      type: CHANGE_PAGE,
      payload: page,
    });
    dispatch({
      type: IS_LOADING,
    });

    await dispatch(fetchTimeline());
  };
};

export const fetchTimelinePage = (page, size) => {
  return async (dispatch, getState, config) => {
    const response = await config.requestsApi.getTimeline({
      size,
      page,
      sort: "oldest",
    });
    return response.data;
  };
};

export const fetchLastTimelinePage = () => {
  return async (dispatch, getState, config) => {
    const state = getState();
    const { size, firstPage } = state.timeline;

    const totalHits = firstPage?.hits?.total || 0;
    if (totalHits === 0) return;

    const lastPageNumber = Math.ceil(totalHits / size);

    // Only fetch last page if there are more than 1 page
    if (lastPageNumber <= 1) return;

    dispatch({ type: IS_REFRESHING });

    try {
      const response = await config.requestsApi.getTimeline({
        size,
        page: lastPageNumber,
        sort: "oldest",
      });

      dispatch({
        type: SUCCESS,
        payload: {
          lastPage: response.data,
        },
      });
    } catch (error) {
      dispatch({ type: HAS_ERROR, payload: error });
    }
  };
};

const timelineReload = (dispatch, getState, config) => {
  const state = getState();
  const { loading, refreshing, error } = state.timeline;
  const { isLoading: isSubmitting } = state.timelineCommentEditor;

  if (error) {
    dispatch(clearTimelineInterval());
  }

  const concurrentRequests = loading && refreshing && isSubmitting;
  if (concurrentRequests) return;

  // Fetch only the last page
  dispatch(fetchLastTimelinePage());
};

export const getTimelineWithRefresh = (focusEventId) => {
  return async (dispatch, getState, config) => {
    dispatch({
      type: IS_LOADING,
    });
    // Fetch both first and last pages
    await dispatch(fetchTimeline(focusEventId));
    dispatch(setTimelineInterval());
  };
};

export const setTimelineInterval = () => {
  return async (dispatch, getState, config) => {
    const intervalAlreadySet = intervalManager.intervalId;

    if (!intervalAlreadySet) {
      const intervalId = setInterval(
        () => timelineReload(dispatch, getState, config),
        config.refreshIntervalMs
      );
      intervalManager.setIntervalId(intervalId);
    }
  };
};

export const clearTimelineInterval = () => {
  return (dispatch, getState, config) => {
    intervalManager.resetInterval();
  };
};
