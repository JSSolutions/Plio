import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { updateViewedBy } from '/imports/api/actions/methods.js';
import { ActionDocumentTypes } from '/imports/api/constants.js';

Template.ActionItem.viewmodel({
  share: 'window',
  mixin: ['date', 'action', 'organization', 'actionStatus'],
  autorun() {
    if (this._id() === this.actionId() && this.isNew()) {
      Tracker.nonreactive(() => this.updateViewedBy());
    }
  },
  _documentType: '',
  onCreated() {
    this.loadStatusMixinByDocType(this._documentType());
  },
  loadStatusMixinByDocType(documentType) {
    switch(documentType) {
      case ActionDocumentTypes.ACTION:
        this.load({ mixin: 'actionStatus' });
        break;
      case ActionDocumentTypes.NC:
      case ActionDocumentTypes.RISK:
        this.load({ mixin: 'problemsStatus' });
        break;
      default:
        return;
        break;
    }
  },
  isNew() {
    return !this.viewedBy().find(_id => _id === Meteor.userId());
  },
  updateViewedBy() {
    const _id = this._id();

    updateViewedBy.call({ _id });
  },
  navigate() {
    if ($(window).width() < 768) {
      this.width($(window).width());
    }

    FlowRouter.setParams({ workItemId: this._id() });
  }
});