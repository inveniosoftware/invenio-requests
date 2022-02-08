import { IS_LOADING, SUCCESS, HAS_ERROR, IS_REFRESHING } from './actions';

export const initialState = {
  loading: false,
  refreshing: false,
  data: {  },
  error: null,
};

export const timelineReducer = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOADING:
      return { ...state, loading: true };
    case IS_REFRESHING:
    return { ...state, refreshing: true };
    case SUCCESS:
      return {
        ...state,
        refreshing: false,
        loading: false,
        data: action.payload,
        error: null,
      };
    case HAS_ERROR:
      return {
        ...state,
        refreshing: false,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
