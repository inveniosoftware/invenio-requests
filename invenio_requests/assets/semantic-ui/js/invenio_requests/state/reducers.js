import {
  timelineReducer
} from '../timeline/state/reducer';
import { combineReducers } from 'redux';

export default function createReducers() {
  return combineReducers({
      timeline: timelineReducer,
  });
}
