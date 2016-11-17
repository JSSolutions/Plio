import { compose, withHandlers, withProps, shouldUpdate } from 'recompose';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { connect } from 'react-redux';
import { _ } from 'meteor/underscore';

import { getSubNestingClassName } from '../../helpers';
import StandardsLHSListItem from '../../components/StandardsLHSListItem';
import _organization_ from '/imports/startup/client/mixins/organization';
import _user_ from '/imports/startup/client/mixins/user';
import _date_ from '/imports/startup/client/mixins/date';
import { setUrlItemId } from '/client/redux/actions/globalActions';
import { updateViewedBy } from '/imports/api/standards/methods';
import withUpdateViewedBy from '../../../helpers/withUpdateViewedBy';
import { omitC } from '/imports/api/helpers';

// TODO: unreadMessagesCount support

export default compose(
  connect(),
  withHandlers({
    onClick: props => handler => {
      props.dispatch(setUrlItemId(props._id));

      handler({ urlItemId: props._id });
    },
  }),
  withProps((props) => {
    const href = (() => {
      const params = {
        urlItemId: props._id,
        orgSerialNumber: props.orgSerialNumber,
      };
      const queryParams = {
        filter: props.filter || 1,
      };

      return FlowRouter.path('standard', params, queryParams);
    })();
    const className = getSubNestingClassName(props);
    const isNew = _organization_.isNewDoc({ doc: props, userId: props.userId });
    const deletedByText = _user_.userNameOrEmail(props.deletedBy);
    const deletedAtText = _date_.renderDate(props.deletedAt);
    const isActive = props.urlItemId === props._id;

    return {
      href,
      className,
      isNew,
      deletedByText,
      deletedAtText,
      isActive,
    };
  }),
  withUpdateViewedBy(updateViewedBy),
  shouldUpdate((props, nextProps) => {
    const omitKeys = omitC(['urlItemId', 'section', 'type']);

    return !_.isEqual(omitKeys(props), omitKeys(nextProps));
  }),
)(StandardsLHSListItem);
