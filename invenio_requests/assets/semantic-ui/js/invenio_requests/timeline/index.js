import { connect } from 'react-redux';
import { fetchTimeline } from './state/actions';
import TimelineFeedComponent from './TimelineFeed';

const mapDispatchToProps = (dispatch) => ({
  fetchTimeline: () => dispatch(fetchTimeline()),
});

const mapStateToProps = (state) => ({
  loading: state.timeline.loading,
  timeline: state.timeline.data,
  error: state.timeline.error,
});

export const Timeline = connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineFeedComponent);
