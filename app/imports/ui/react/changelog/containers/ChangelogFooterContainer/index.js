import { compose, withHandlers, withProps } from 'recompose';
import { composeWithTracker } from 'react-komposer';
import { connect } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import Counter from '/imports/api/counter/client';
import {
  setLoadingLogsCount,
  setLogsCount,
  setShowAll,
} from '/client/redux/actions/changelogActions';
import { lastLogsLimit } from '../../constants';
import ChangelogFooter from '../../components/ChangelogFooter';
import propTypes from './propTypes';

const onPropsChange = (props, onData) => {
  let subscription;
  const { documentId, collection, dispatch } = props;

  if (!documentId) {
    onData(null, props);
  } else {
    const counterName = `doc-logs-count-${documentId}`;

    subscription = Meteor.subscribe(
      'auditLogsCount',
      counterName,
      documentId,
      collection
    );

    dispatch(setLoadingLogsCount(true));

    if (subscription.ready()) {
      dispatch(batchActions([
        setLoadingLogsCount(false),
        setLogsCount(Counter.get(counterName)),
      ]));
    }

    onData(null, props);
  }

  return () => typeof subscription === 'function' && subscription.stop();
};

const onViewRecentClick = props => () => props.dispatch(setShowAll(false));

const ChangelogFooterContainer = compose(
  connect(),
  composeWithTracker(onPropsChange),
  connect(state => _.pick(state.changelog, [
    'logsCount',
    'isLoadingAllLogs',
    'isAllLogsLoaded',
    'isLoadingLogsCount',
    'showAll',
  ])),
  withProps({ lastLogsLimit }),
  withHandlers({ onViewRecentClick })
)(ChangelogFooter);

ChangelogFooterContainer.propTypes = propTypes;

export default ChangelogFooterContainer;