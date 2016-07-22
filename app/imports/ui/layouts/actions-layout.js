import { Template } from 'meteor/templating';
import { OrgSubs, UserSubs } from '/imports/startup/client/subsmanagers.js';

Template.ActionsLayout.viewmodel({
  mixin: ['organization', 'action'],
  _subHandlers: [],
  isReady: false,
  autorun: [
    function() {
      const orgSerialNumber = this.organizationSerialNumber();
      const org = this.organization();
      const { _id, users } = !!org && org;
      const userIds = _.pluck(users, 'userId');
      const _subHandlers = [
        OrgSubs.subscribe('currentUserOrganizationBySerialNumber', orgSerialNumber),
        UserSubs.subscribe('organizationUsers', userIds),
        this.templateInstance.subscribe('nonConformities', _id),
        this.templateInstance.subscribe('risks', _id),
      ];

      if (this.isActiveActionFilter('Deleted actions')) {
        _subHandlers.push(this.templateInstance.subscribe('actions', _id, true));
      } else {
        _subHandlers.push(this.templateInstance.subscribe('actions', _id));
      }

      this._subHandlers(_subHandlers);
    },
    function() {
      this.isReady(this._subHandlers().every(handle => handle.ready()));
    }
  ]
});