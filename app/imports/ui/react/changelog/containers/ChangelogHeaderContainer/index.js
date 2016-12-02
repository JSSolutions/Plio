import { compose, mapProps, shouldUpdate } from 'recompose';
import { composeWithTracker } from 'react-komposer';
import { connect } from 'react-redux';

import { AuditLogs } from '/imports/share/collections/audit-logs';
import { LastHumanLogSubs } from '/imports/startup/client/subsmanagers';
import { SystemName } from '/imports/share/constants';
import {
  getCollectionByName,
  getFormattedDate,
  getUserFullNameOrEmail,
} from '/imports/share/helpers';
import {
  setChangelogDocument,
  setLastHumanLog,
  setLoadingLastHumanLog,
} from '/client/redux/actions/changelogActions';
import { pickC, shallowCompare } from '/imports/api/helpers';
import ChangelogHeader from '../../components/ChangelogHeader';
import propTypes from './propTypes';

const onPropsChange = (props, onData) => {
  let subscription;
  const { dispatch, documentId, collection } = props;

  if (!documentId) {
    onData(null, props);
  } else {
    const docCollection = getCollectionByName(collection);
    const doc = docCollection && docCollection.findOne({ _id: documentId });

    if (doc) {
      dispatch(setChangelogDocument(doc));
    }

    subscription = LastHumanLogSubs.subscribe('lastHumanLog', documentId, collection);

    dispatch(setLoadingLastHumanLog(true));

    if (subscription.ready()) {
      const lastHumanLog = AuditLogs.findOne({
        documentId,
        executor: { $ne: SystemName },
      }, {
        sort: { date: -1 },
      });

      if (lastHumanLog) {
        dispatch(setLastHumanLog(lastHumanLog));
      }

      dispatch(setLoadingLastHumanLog(false));
    }

    onData(null, props);
  }

  return () => typeof subscription === 'function' && subscription.stop();
};

const mapStateToProps = (state) => {
  const {
    isChangelogCollapsed,
    isLoadingLastHumanLog,
    isLoadingLastLogs,
    lastHumanLog,
    changelogDocument,
  } = state.changelog;

  const props = {
    createdAt: '',
    createdBy: '',
    updatedAt: '',
    updatedBy: '',
  };

  const getPrettyDate = date => getFormattedDate(date, 'DD MMM YYYY');

  if (lastHumanLog) {
    Object.assign(props, {
      updatedAt: getPrettyDate(lastHumanLog.date),
      updatedBy: getUserFullNameOrEmail(lastHumanLog.executor),
    });
  }

  if (changelogDocument) {
    Object.assign(props, {
      createdAt: getPrettyDate(changelogDocument.createdAt),
      createdBy: getUserFullNameOrEmail(changelogDocument.createdBy),
    });
  }

  return {
    ...props,
    isChangelogCollapsed,
    isLoadingLastHumanLog,
    isLoadingLastLogs,
  };
};

const ChangelogHeaderContainer = compose(
  connect(),

  composeWithTracker(onPropsChange, null, null, {
    shouldResubscribe: (props, nextProps) =>
      props.documentId !== nextProps.documentId,
  }),

  connect(mapStateToProps),

  mapProps(props => pickC([
    'isChangelogCollapsed',
    'isLoadingLastHumanLog',
    'isLoadingLastLogs',
    'createdBy',
    'createdAt',
    'updatedBy',
    'updatedAt',
  ])(props)),

  shouldUpdate(shallowCompare),
)(ChangelogHeader);

ChangelogHeaderContainer.propTypes = propTypes;

export default ChangelogHeaderContainer;