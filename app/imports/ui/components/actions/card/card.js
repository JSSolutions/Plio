import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import get from 'lodash.get';

import { ActionPlanOptions } from '/imports/share/constants.js';

Template.Actions_Card_Read.viewmodel({
  mixin: ['organization', 'workInbox', 'user', 'date', 'modal', 'router', 'collapsing', 'actionStatus'],
  isReadOnly: false,
  action() {
    return this._getActionByQuery({ _id: this._id() });
  },
  getActionTitle() {
    return this._getNameByType(this.action() && this.action().type);
  },
  getClassForPlanInPlace(plan) {
    switch(plan) {
      case ActionPlanOptions.YES:
        return 'text-success';
        break;
      case ActionPlanOptions.NO:
        return 'text-danger';
        break;
      case ActionPlanOptions.NOT_NEEDED:
        return 'text-primary';
        break;
      default:
        return 'text-primary';
        break;
    }
  },
  getVerifiedDateLabel({ isVerifiedAsEffective } = {}) {
    return isVerifiedAsEffective
      ? 'Verified as effective date'
      : 'Assessed as ineffective date';
  },
  actions() {
    const organizationId = this.organizationId();
    return this._getActionsByQuery({ organizationId });
  },
  openEditModal() {
    const _title = this.getActionTitle();
    this.modal().open({
      _title,
      template: 'Actions_Edit',
      _id: get(this.action(), '_id')
    });
  }
});
