import { Template } from 'meteor/templating';
import { Organizations } from '/imports/share/collections/organizations';

import { extractIds } from '/imports/api/helpers';

Template.UserDirectory_List.viewmodel({
  mixin: ['organization', 'modal', 'router'],
  listArgs() {
    return {
      modalButtonText: 'Invite',
      onModalOpen: this.onInviteClick.bind(this),
      onSearchInputValue: this.onSearchInputValue.bind(this),
      onAfterSearch: this.onAfterSearch(),
    };
  },
  onInviteClick(event) {
    event.preventDefault();

    const organizationId = this.organizationId();

    this.modal().open({
      organizationId,
      template: 'UserDirectory_InviteUsers',
      _title: 'Invite users',
      submitCaption: 'Invite',
      submitCaptionOnSave: 'Inviting...',
      closeCaption: 'Cancel',
      variation: 'save'
    });
  },
  onSearchInputValue(value) {
    return extractIds(this.organizationUsers());
  },
  onAfterSearch() {
    return (searchText, searchResult) => {
      if (searchText && searchResult.length) {
        this.goToUser(searchResult[0]);
      }
    };
  },
});
