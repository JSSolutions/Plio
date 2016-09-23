import { Template } from 'meteor/templating';

import { ActionTypes, UncategorizedTypeSection } from '/imports/api/constants.js';
import { RiskTypes } from '/imports/api/risk-types/risk-types.js';
import { DocumentCardSubs } from '/imports/startup/client/subsmanagers.js';
import { restore, remove } from '/imports/api/risks/methods.js';

Template.Risks_Card_Read.viewmodel({
  mixin: ['organization', 'risk', 'problemsStatus', 'utils', 'user', 'date', 'modal', 'router', 'collapsing', 'workInbox'],
  isReadOnly: false,

  onCreated(template) {
    template.autorun(() => {
      const _id = this._id();
      const organizationId = this.organizationId();
      if (_id && organizationId) {
        DocumentCardSubs.subscribe('riskCard', { _id, organizationId });
      }
    });
  },
  ActionTypes() {
    return ActionTypes;
  },
  risks() {
    const organizationId = this.organizationId();
    const query = this.isActiveRiskFilter(4)
      ? { isDeleted: true }
      : { isDeleted: { $in: [null, false] } };

    return this._getRisksByQuery({ organizationId, ...query }).fetch();
  },
  risk() {
    return this._getRiskByQuery({ _id: this._id() });
  },
  type() {
    const risk = Object.assign({}, this.risk());
    const type = RiskTypes.findOne({ _id: risk.typeId });
    return type || UncategorizedTypeSection;
  },
  onOpenEditModalCb() {
    return this.openEditModal.bind(this);
  },
  openEditModal() {
    this.modal().open({
      _title: 'Risk',
      template: 'Risks_Card_Edit',
      _id: this.risk() && this.risk()._id
    });
  },
  onRestoreCb() {
    return this.restore.bind(this);
  },
  restore({ _id, title, isDeleted }, cb = () => {}) {
    if (!isDeleted) return;

    const callback = (err) => {
      cb(err, () => {
        FlowRouter.setQueryParams({ filter: 1 });
        Meteor.setTimeout(() => {
          this.goToRisk(_id);
          this.expandCollapsed(_id);
        }, 0);
      });
    };

    restore.call({ _id }, callback);
  },
  onDeleteCb() {
    return this.delete.bind(this);
  },
  delete({ _id, title, isDeleted }, cb = () => {}) {
    if (!isDeleted) return;

    const callback = (err) => {
      cb(err, () => {
        const risks = this._getRisksByQuery({});

        if (risks.count() > 0) {
          Meteor.setTimeout(() => {
            this.goToRisks();
          }, 0);
        }
      });
    };

    remove.call({ _id }, callback);
  }
});
