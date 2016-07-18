import { Template } from 'meteor/templating';

import { update, remove, updateViewedBy } from '/imports/api/non-conformities/methods.js';
import { isViewed } from '/imports/api/checkers.js';

Template.NC_Card_Edit.viewmodel({
  mixin: ['organization', 'nonconformity', 'modal', 'callWithFocusCheck'],
  autorun() {
    const doc = this.NC();
    const userId = Meteor.userId();

    if (!isViewed(doc, userId)) {
      Tracker.nonreactive(() => updateViewedBy());
    }
  },
  updateViewedBy() {
    const _id = this._id();

    updateViewedBy.call({ _id });
  },
  NC() {
    return this._getNCByQuery({ _id: this._id() });
  },
  slingshotDirective: 'nonConformitiesFiles',
  uploaderMetaContext() {
    return {
      organizationId: this.organizationId(),
      nonConformityId: this._id()
    };
  },
  onUpdateNotifyUserCb() {
    return this.onUpdateNotifyUser.bind(this);
  },
  onUpdateNotifyUser({ query, options }, cb) {
    return this.update({ query, options }, cb);
  },
  onUpdateCb() {
    return this.update.bind(this);
  },
  update({ query = {}, options = {}, e = {}, withFocusCheck = false, ...args }, cb = () => {}) {
    const _id = this._id();
    const allArgs = { ...args, _id, options, query };

    const updateFn = () => this.modal().callMethod(update, allArgs, cb);

    if (withFocusCheck) {
      this.callWithFocusCheck(e, updateFn);
    } else {
      updateFn();
    }
  },
  remove() {
    const { title } = this.NC();
    const _id = this._id();

    swal(
      {
        title: 'Are you sure?',
        text: `The non-conformity "${title}" will be removed.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        closeOnConfirm: false
      },
      () => {
        this.modal().callMethod(remove, { _id }, (err) => {
          if (err) return;
          swal('Removed!', `The non-conformity "${title}" was removed successfully.`, 'success');

          this.modal().close();
        });
      }
    );
  },
});
