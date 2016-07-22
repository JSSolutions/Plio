import { Template } from 'meteor/templating';

import { updateViewedBy } from '/imports/api/non-conformities/methods.js';
import { isViewed } from '/imports/api/checkers.js';

Template.Risk_Card_Edit_Main.viewmodel({
  mixin: 'organization',
  onRendered(templateInstance) {
    const doc = templateInstance.data.risk;
    const userId = Meteor.userId();

    if(doc && !isViewed(doc, userId)) {
      updateViewedBy.call({ _id: doc._id });
    }
  },
  NCGuidelines() {
    return this.organization() && this.organization().ncGuidelines;
  },
  update(...args) {
    this.parent().update(...args);
  }
});