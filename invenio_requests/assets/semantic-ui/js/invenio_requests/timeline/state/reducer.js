import { IS_LOADING, SUCCESS, HAS_ERROR } from './actions';

export const initialState = {
  loading: true,
  data: {  },
  error: null,
};

export const timelineReducer = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOADING:
      return { ...state, loading: true };
    case SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case HAS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
