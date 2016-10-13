import { Template } from 'meteor/templating';

import { ProblemsStatuses } from '/imports/api/constants.js';
import { lengthItems, inspire } from '/imports/api/helpers.js';
import { Departments } from '/imports/api/departments/departments.js';

Template.Problems_ListWrapper.viewmodel({
  share: 'search',
  mixin: ['organization', 'search'],
  statusesData: ProblemsStatuses,
  listArgs() {
    return {
      ...inspire(['statuses', 'departments', 'deleted', '_getSearchQuery', '_getSearchOptions'], this)
    };
  },
  _getSearchQuery() {
     return this.searchObject('searchText', [{ name: 'title' }, { name: 'sequentialId' }]);
   },
  _getSearchOptions(defaults = { sort: { createdAt: -1 } }) {
    return this.searchText()
      ? { sort: { sequentialId: 1, title: 1 } }
      : defaults;
  },
  statuses() {
    const mapper = (status) => {
      const query = { status, ...this._getSearchQuery() };
      const items = this.collection().find(query, this._getSearchOptions()).fetch();

      return { status, items };
    };
    const keys = Object.keys(this.statusesData()).map(s => parseInt(s, 10));

    return keys.map(mapper).filter(lengthItems);
  },
  departments() {
    const organizationId = this.organizationId();
    const mainQuery = {
      organizationId,
      ...this._getSearchQuery()
    };

    const mapper = (department) => {
      const query = {
        ...mainQuery,
        departmentsIds: department._id
      };
      const items = this.collection().find(query, this._getSearchOptions()).fetch();

      return { ...department, items };
    };

    const departments = ((() => {
      const query = { organizationId };
      const options = { sort: { name: 1 } };

      return Departments.find(query, options).fetch();
    })());

    const uncategorized = ((() => {
      const filterFn = nc => !departments.find(department =>
        nc.departmentsIds.includes(department._id));
      const items = this.collection()
        .find(mainQuery, this._getSearchOptions())
        .fetch()
        .filter(filterFn);

      return {
        organizationId,
        items,
        _id: 'NonConformities.departments.uncategorized',
        name: 'Uncategorized'
      };
    })());

    return departments
      .map(mapper)
      .concat(uncategorized)
      .filter(lengthItems);
  },
  deleted() {
    const query = { ...this._getSearchQuery(), isDeleted: true };
    const options = this._getSearchOptions({ sort: { deletedAt: -1 } });
    return this.collection().find(query, options).fetch();
  }
});