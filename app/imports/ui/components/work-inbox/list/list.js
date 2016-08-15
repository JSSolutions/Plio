import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import { ActionDocumentTypes, WorkItemsStore } from '/imports/api/constants.js';
const { TYPES } = WorkItemsStore;

Template.WorkInbox_List.viewmodel({
  share: 'search',
  mixin: [
    'search', 'collapsing', 'organization',
    'modal', 'workInbox', 'router',
    'user', 'nonconformity', 'risk',
    'utils', { STATUSES: 'workItemStatus' }
  ],
  autorun() {
    if (!this.list.focused() && !this.list.animating() && !this.list.searchText()) {
      const items = this._getItemsByFilter() || [];
      const contains = items.find(({ _id }) => _id === this.workItemId());

      if (!contains) {
        const { _id } = items.find((el, i, arr) => arr.length) || {}; // get _id of the first element if it exists

        if (_id) {
          Meteor.setTimeout(() => {
            this.goToWorkItem(_id);
            this.expandCollapsed(_id);
          }, 0);
        } else {
          Meteor.setTimeout(() => {
            this.goToWorkInbox();
          }, 0)
        }
      }
    }
  },
  _getItemsByFilter() {
    const { my = {}, team = {} } = this.items() || {};
    switch(this.activeWorkInboxFilterId()) {
      case 1:
        return my.current;
        break;
      case 2:
        return team.current;
        break;
      case 3:
        return my.completed;
        break;
      case 4:
        return team.completed;
        break;
      case 5:
        return my.deleted;
        break;
      case 6:
        return team.deleted;
        break;
      default:
        return {};
        break;
    };
  },
  getPendingItems(_query = {}) {
    const linkedDocsIds = ['_getNCsByQuery', '_getRisksByQuery', '_getActionsByQuery']
        .map(prop => this[prop]().map(({ _id }) => _id))
        .reduce((prev, cur) => [...prev, ...cur]);

    const workItems = this._getWorkItemsByQuery({
      ..._query,
      'linkedDoc._id': { $in: linkedDocsIds }
    }).fetch();

    return _(workItems)
      .map(item => ({ linkedDocument: item.getLinkedDoc(), ...item }))
      .filter((item) => {
        const searchQuery = this.searchObject('searchText', [{ name: 'title' }, { name: 'sequentialId' }, { name: 'type' }]);

        if (_.keys(searchQuery).length) {
          const [{ title }, { sequentialId }, { type }] = searchQuery.$or;

          return type.test(item.type) ||
                 title.test(item.linkedDocument.title) ||
                 sequentialId.test(item.linkedDocument.sequentialId);
        }

        return true;
      });
  },
  assignees() {
    const getIds = query => this.getPendingItems(query);
    const byStatus = (array, predicate) => (
      array.filter(({ assigneeId, status }) => assigneeId !== Meteor.userId() && predicate(status))
    );
    const extractIds = array => array.map(({ assigneeId }) => assigneeId);
    const sortByFirstName = (array) => {
      const query = {
        _id: {
          $in: [...(() => array.map(({ assigneeId }) => assigneeId))()]
        }
      };
      const options = { sort: { 'profile.firstName': 1 } };
      const users = Meteor.users.find(query, options);
      const ids = users.map(({ _id }) => _id);
      return ids;
    };

    const current = sortByFirstName(byStatus(getIds(), status => this.STATUSES.IN_PROGRESS().includes(status)));
    const completed = sortByFirstName(byStatus(getIds(), status => this.STATUSES.COMPLETED() === status));
    const deleted = sortByFirstName(byStatus(getIds({ isDeleted: true }), status => true));

    return {
      current,
      completed,
      deleted
    };
  },
  getTeamItems(userId, prop) {
    const { team = {} } = this.items(userId) || {};
    return team[prop];
  },
  items(userId) {
    const getInitialItems = query => this.getPendingItems(query);
    const byAssignee = (array, predicate) => array.filter(({ assigneeId }) => predicate(assigneeId));
    const byStatus = (array, predicate) => array.filter(({ status }) => predicate(status));
    const byDeleted = (array, predicate) => array.filter(({ isDeleted }) => predicate(isDeleted));
    const sortItems = array => (
      array.sort(({ targetDate:d1 }, { targetDate:d2 }) => d2 - d1)
    );

    const allItems = [...new Set(getInitialItems({}))];
    const myItems = byAssignee(allItems, assigneeId => assigneeId === Meteor.userId());
    const teamItems = byAssignee(allItems, assigneeId => userId ? assigneeId === userId : assigneeId !== Meteor.userId());

    const isInProgress = status => this.STATUSES.IN_PROGRESS().includes(status);
    const isCompleted = status => this.STATUSES.COMPLETED() === status;
    const isDel = bool => isDeleted => bool ? isDeleted : !isDeleted;

    const getObj = (items) => {
      return {
        current: sortItems(byDeleted(byStatus(items, isInProgress), isDel(false))),
        completed: sortItems(byDeleted(byStatus(items, isCompleted), isDel(false))),
        deleted: sortItems(byDeleted(items, isDel(true)))
      };
    };

    return {
      my: getObj(myItems),
      team: getObj(teamItems)
    };
  },
  linkedDocId() {
    const { linkedDoc: { _id } = {} } = this._getWorkItemByQuery({ _id: this.workItemId() }) || {};
    return _id;
  },
  onSearchInputValue() {
    return (value) => {
      const { my: { current, completed, deleted } = {} } = this.items() || {};

      if (this.isActiveWorkInboxFilter(1)) {
        return current;
      } else if (this.isActiveWorkInboxFilter(3)) {
        return completed;
      } else if (this.isActiveWorkInboxFilter(5)) {
        return deleted;
      }

      const sections = ViewModel.find('WorkInbox_SectionItem');
      const ids = this.toArray(sections).map(vm => vm.items && vm.items().map(({ _id }) => _id));
      return _.flatten(ids);
    };
  },
  onModalOpen() {
    return () =>
      this.modal().open({
        _title: 'Add',
        template: 'Actions_ChooseTypeModal',
        variation: 'simple',
      });
  }
});
