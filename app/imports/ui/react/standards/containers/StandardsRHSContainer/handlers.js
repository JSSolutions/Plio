import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';

import { setIsFullScreenMode } from '/client/redux/actions/standardsActions';
import modal from '/imports/startup/client/mixins/modal';
import { StandardsHelp } from '/imports/api/help-messages';
import { getId } from '/imports/api/helpers';
import swal from '/imports/ui/utils/swal';
import { restore, remove } from '/imports/api/standards/methods';
import { isOrgOwner } from '/imports/api/checkers';
import { STANDARD_FILTER_MAP } from '/imports/api/constants';

export const onToggleScreenMode = props => e => {
  const $div = $(e.target).closest('.content-cards-inner');
  const offset = $div.offset();

  if (props.isFullScreenMode) {
    props.dispatch(setIsFullScreenMode(false));

    setTimeout(() => {
      const css = {
        position: 'inherit',
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
        left: 'auto',
        transition: 'none',
      };

      $div.css(css);
    }, 150);
  } else {
    const css = {
      position: 'fixed',
      top: offset.top,
      right: $(window).width() - (offset.left + $div.outerWidth()),
      bottom: '0',
      left: offset.left,
    };
    $div.css(css);

    setTimeout(() => {
      // Safari workaround
      $div.css({ transition: 'all .15s linear' });

      props.dispatch(setIsFullScreenMode(true));
    }, 100);
  }
};

export const onModalOpen = props => () =>
  modal.modal.open({
    _title: props.names.headerNames.header,
    template: 'EditStandard',
    helpText: StandardsHelp.standard,
    _id: getId(props.standard),
  });


export const onRestore = ({
  standard: {
    _id,
    title,
    isDeleted,
  } = {},
}) => () => {
  if (!isDeleted) return;

  const options = {
    text: `The standard "${title}" will be restored!`,
    confirmButtonText: 'Restore',
  };
  const cb = (err) => {
    if (err) swal.error(err);

    swal.success('Restored!', `The standard "${title}" was restored successfully.`);

    const params = { orgSerialNumber: FlowRouter.getParam('orgSerialNumber'), urlItemId: _id };
    const queryParams = { filter: STANDARD_FILTER_MAP.SECTION };

    Meteor.setTimeout(() => FlowRouter.go('standard', params, queryParams), 0);
  };

  swal(options, () => restore.call({ _id }, cb));
};

export const onDelete = ({
  standard: {
    _id,
    title,
    isDeleted,
  } = {},
  userId,
  organizationId,
}) => () => {
  if (!isDeleted || !isOrgOwner(userId, organizationId)) return;

  const options = {
    text: `The standard "${title}" will be deleted permanently!`,
    confirmButtonText: 'Delete',
  };
  const cb = (err) => {
    if (err) swal.error(err);

    swal.success('Deleted!', `The standard "${title}" was removed successfully.`);
  };

  swal(options, () => remove.call({ _id }, cb));
};
