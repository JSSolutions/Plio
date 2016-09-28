import { Meteor } from 'meteor/meteor';

import BackgroundApp from './background-app.js';


export default AuditManager = {

  _isAuditStarted: false,

  startAudit() {
    this._isAuditStarted = true;
  },

  stopAudit() {
    this._isAuditStarted = false;
  },

  isAuditStarted() {
    return this._isAuditStarted === true;
  },

  documentCreated(newDocument, userId, collectionName) {
    BackgroundApp.call('documentCreated', {
      newDocument, userId, collectionName
    });
  },

  documentUpdated(newDocument, oldDocument, userId, collectionName) {
    BackgroundApp.call('documentUpdated', {
      newDocument, oldDocument, userId, collectionName
    });
  },

  documentRemoved(oldDocument, userId, collectionName) {
    BackgroundApp.call('documentRemoved', {
      oldDocument, userId, collectionName
    });
  },

  registerCollection(collection, collectionName) {
    const auditManager = this;

    collection.after.insert(function(userId, doc) {
      Meteor.defer(() => {
        if (auditManager.isAuditStarted()) {
          auditManager.documentCreated(doc, userId, collectionName);
        }
      });
    });

    collection.after.update(function(userId, doc, fieldNames, modifier, options) {
      Meteor.defer(() => {
        if (auditManager.isAuditStarted()) {
          auditManager.documentUpdated(doc, this.previous, userId, collectionName);
        }
      });
    });

    collection.after.remove(function(userId, doc) {
      Meteor.defer(() => {
        if (auditManager.isAuditStarted()) {
          auditManager.documentRemoved(doc, userId, collectionName);
        }
      });
    });
  }

};
