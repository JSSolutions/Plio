import { Meteor } from 'meteor/meteor';
import { Actions } from '../actions.js';
import { Files } from '/imports/api/files/files.js';
import { isOrgMember } from '../../checkers.js';
import Counter from '../../counter/server.js';

const getActionOtherFiles = (action) => {
  const fileIds = action.fileIds || [];
  return Files.find({ _id: { $in: fileIds } });
};

Meteor.publishComposite('actions', function(organizationId, isDeleted = { $in: [null, false] }) {
  return {
    find() {
      const userId = this.userId;
      if (!userId || !isOrgMember(userId, organizationId)) {
        return this.ready();
      }

      return Actions.find({
        organizationId,
        isDeleted
      });
    },
    children: [{
      find(action) {
        getActionOtherFiles(action);
      }
    }]
  }
});

Meteor.publishComposite('actionsByIds', function(ids = []) {
  return {
    find() {
      let query = {
        _id: { $in: ids },
        isDeleted: { $in: [null, false] }
      };

      const { organizationId } = Object.assign({}, Actions.findOne(query));
      const userId = this.userId;

      if (!userId || !isOrgMember(userId, organizationId)) {
        return this.ready();
      }

      query = { ...query, organizationId };

      return Actions.find(query);
    },
    children: [{
      find(action) {
        getActionOtherFiles(action);
      }
    }]
  }
});

Meteor.publish('actionsCount', function(counterName, organizationId) {
  const userId = this.userId;
  if (!userId || !isOrgMember(userId, organizationId)) {
    return this.ready();
  }

  return new Counter(counterName, Actions.find({
    organizationId,
    isDeleted: { $in: [false, null] }
  }));
});

Meteor.publish('actionsNotViewedCount', function(counterName, organizationId) {
  const userId = this.userId;
  if (!userId || !isOrgMember(userId, organizationId)) {
    return this.ready();
  }

  return new Counter(counterName, Actions.find({
    organizationId,
    viewedBy: { $ne: userId },
    isDeleted: { $in: [false, null] }
  }));
});
