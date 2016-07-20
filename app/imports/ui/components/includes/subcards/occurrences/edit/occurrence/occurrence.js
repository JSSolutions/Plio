import { Template } from 'meteor/templating';
import { updateViewedBy } from '/imports/api/occurrences/methods.js';
import { isViewed } from '/imports/api/checkers.js';

Template.Subcards_Occurrence.viewmodel({
  date: new Date(),
  description: '',
  onRendered(templateInstance) {
    const doc = templateInstance.data.doc;
    const userId = Meteor.userId();
    
    if(doc && !isViewed(doc, userId)) {
      updateViewedBy.call({ _id: doc._id });
    }
  },
  onDateChangedCb() {
    return this.onDateChanged.bind(this);
  },
  onDateChanged(viewmodel) {
    const { date } = viewmodel.getData();
    this.date(date);
    this.parent().update({ date });
  },
  updateDescription(e) {
    const { description } = this.getData();
    this.parent().update({ description, e, withFocusCheck: true });
  },
  getData() {
    const { description, date } = this.data();
    return { description, date };
  }
});
