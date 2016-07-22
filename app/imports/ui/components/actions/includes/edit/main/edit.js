import { Template } from 'meteor/templating';

import { ActionPlanOptions } from '/imports/api/constants.js';
import { updateViewedBy } from '/imports/api/actions/methods.js';
import { isViewed } from '/imports/api/checkers.js';

Template.Actions_Card_Edit_Main.viewmodel({
  _id: '',
  title: '',
  status: 0,
  ownerId: Meteor.userId(),
  planInPlace: ActionPlanOptions.NO,
  isCompleted: false,
  completionTargetDate: '',
  toBeCompletedBy: '',
  completedAt: '',
  completedBy: '',
  completionComments: '',
  isVerified: false,
  verificationTargetDate: '',
  toBeVerifiedBy: '',
  verifiedAt: '',
  verifiedBy: '',
  verificationComments: '',
  linkedStandardsIds: [],
  linkedTo: [],
  onRendered(templateInstance) {
    const action = templateInstance.data.action;
    const userId = Meteor.userId();
    
    if (action && !isViewed(action, userId)) {
      updateViewedBy.call({ _id: action._id });
    }
  },
  autorun() {
    const action = this.action && this.action();
    action && this.load(action);
  },
  isCompletionEditable() {
    return !this.isVerified();
  },
  update({ ...args }) {
    this.parent().update({ ...args });
  },
  onComplete() {
    return this.completeFn;
  },
  onVerify() {
    return this.verifyFn;
  },
  onUndoCompletion() {
    return this.undoCompletionFn;
  },
  onUndoVerification() {
    return this.undoVerificationFn;
  },
  onLinkStandard() {
    return this.linkStandardFn;
  },
  onUnlinkStandard() {
    return this.unlinkStandardFn;
  },
  onLinkDocument() {
    return this.linkDocumentFn;
  },
  onUnlinkDocument() {
    return this.unlinkDocumentFn;
  },
  getData() {
    return this.children(vm => vm.getData)
                .reduce((prev, cur) => {
                  return { ...prev, ...cur.getData() };
                }, {});
  }
});