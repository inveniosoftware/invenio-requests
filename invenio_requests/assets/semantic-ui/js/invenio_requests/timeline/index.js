import { connect } from 'react-redux';
import { fetchTimeline, setRefreshInterval } from './state/actions';
import TimelineFeedComponent from './TimelineFeed';

const mapDispatchToProps = (dispatch) => ({
  fetchTimeline: (loadingState) => dispatch(fetchTimeline(loadingState)),
  setRefreshInterval: () => dispatch(setRefreshInterval()),
});

const mapStateToProps = (state) => ({
  loading: state.timeline.loading,
  refreshing: state.timeline.refreshing,
  timeline: state.timeline.data,
  error: state.timeline.error,
});

export const Timeline = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineFeedComponent);
