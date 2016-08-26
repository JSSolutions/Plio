import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';


Template.Subcards_ImprovementPlan_Edit.viewmodel({
  mixin: ['collapse', 'modal'],
  autorun() {
    this.load(this.doc());
  },
  improvementPlan: '',
  label: 'Improvement plan',
  _id: '',
  desiredOutcome: '',
  targetDate: '',
  owner: '',
  reviewDates: [],
  files: [],
  doc() {
    return this.improvementPlan() || {};
  },
  isTextPresent() {
    return this.desiredOutcome() || this.files().length;
  },
  getTextIndicator() {
    return this.isTextPresent() ? '<i class="fa fa-align-left disclosure-indicator pull-right"></i>' : '';
  },
  update({ query = {}, options = {}, ...args }, cb) {
    this.parent().update({ query, options, ...args }, cb);
  }
});
