import { Template } from 'meteor/templating';

import { ActionTypes } from '/imports/share/constants.js';
import { NonConformities } from '/imports/share/collections/non-conformities.js';
import { restore, remove } from '/imports/api/non-conformities/methods.js';

Template.NC_Card_Read.viewmodel({
  mixin: ['organization', 'nonconformity', 'user', 'date', 'utils', 'modal', 'currency', 'problemsStatus', 'collapse', 'router', 'collapsing', 'workInbox'],
  isReadOnly: false,
  ActionTypes() {
    return ActionTypes;
  },
  NC() {
    return this._getNCByQuery({ _id: this._id() });
  },
  NCs() {
    const list = ViewModel.findOne('NC_List');
    const query = list && list._getQueryForFilter();
    return this._getNCsByQuery(query);
  },
  hasNCs() {
    return this.NCs().count() > 0;
  },
  getStatus(status) {
    return status || 1;
  },
  renderCost(cost) {
    const currency = this.organization() && this.organization().currency;
    return currency ? this.getCurrencySymbol(currency) + cost : '';
  },
  onOpenEditModalCb() {
    return this.openEditModal.bind(this);
  },
  openEditModal() {
    this.modal().open({
      _title: 'Non-conformity',
      template: 'NC_Card_Edit',
      _id: this.NC() && this.NC()._id
    });
  },
  onRestoreCb() {
    return this.restore.bind(this);
  },
  restore({ _id, isDeleted, title }, cb = () => {}) {
    if (!isDeleted) return;

    const callback = (err) => {
      cb(err, () => {
        FlowRouter.setQueryParams({ filter: 1 });
        Meteor.setTimeout(() => {
          this.goToNC(_id);
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
        const NCs = this._getNCsByQuery({});

        if (NCs.count() > 0) {
          Meteor.setTimeout(() => {
            this.goToNCs();
          }, 0);
        }
      });
    };

    remove.call({ _id }, callback);
  }
});
