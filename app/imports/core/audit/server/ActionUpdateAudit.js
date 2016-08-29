import { ActionStatuses, ProblemTypes, CollectionNames } from '/imports/api/constants.js';
import { NonConformities } from '/imports/api/non-conformities/non-conformities.js';
import { Risks } from '/imports/api/risks/risks.js';
import Utils from '../../utils.js';

import DocumentUpdateAudit from './DocumentUpdateAudit.js';
import FileUpdateAudit from './mixins/FileUpdateAudit.js';
import NotesUpdateAudit from './mixins/NotesUpdateAudit.js';
import OwnerUpdateAudit from './mixins/OwnerUpdateAudit.js';


const base = Utils.inherit(DocumentUpdateAudit, [
  FileUpdateAudit, NotesUpdateAudit, OwnerUpdateAudit
]);

export default class ActionUpdateAudit extends base {

  _buildLogs() {
    _(this._diff).each(diff => {
      if (diff.isProcessed) {
        return;
      }

      switch (diff.field) {
        case 'isCompleted':
          this._completionChanged(diff);
          break;
        case 'isVerified':
          this._verificationChanged(diff);
          break;
        case 'linkedTo':
          this._linkedDocChanged(diff);
          break;
        case 'status':
          this._statusChanged(diff);
          break;
        case 'toBeCompletedBy':
        case 'toBeVerifiedBy':
          this._userChanged(diff);
          break;
      }
    });

    super._buildLogs();
  }

  _completionChanged(diff) {
    const completedAtDiff = _(this._diff).find(({ field }) => field === 'completedAt');
    const completedByDiff = _(this._diff).find(({ field }) => field === 'completedBy');

    if (!(completedAtDiff && completedByDiff)) {
      return;
    }

    const commentsDiff = _(this._diff).find(
      ({ field }) => field === 'completionComments'
    );

    const { newValue } = diff;
    let message;

    if (newValue === true) {
      const { newValue:comments } = commentsDiff || {};
      message = comments ? `Action completed: ${comments}` : 'Completed';
    } else if (newValue === false) {
      message = 'Completion canceled';
    }

    if (!message) {
      return;
    }

    const logData = { message };
    if (newValue === true) {
      const { newValue:executor } = completedByDiff;
      const { newValue:date } = completedAtDiff;
      _(logData).extend({ date, executor });
    }

    this._createLog(logData);

    diff.isProcessed = true;
    completedAtDiff.isProcessed = true;
    completedByDiff.isProcessed = true;
    commentsDiff && (commentsDiff.isProcessed = true);
  }

  _verificationChanged(diff) {
    const verifiedAtDiff = _(this._diff).find(({ field }) => field === 'verifiedAt');
    const verifiedByDiff = _(this._diff).find(({ field }) => field === 'verifiedBy');

    if (!(verifiedAtDiff && verifiedByDiff)) {
      return;
    }

    const commentsDiff = _(this._diff).find(
      ({ field }) => field === 'verificationComments'
    );

    const effectiveDiff = _(this._diff).find(
      ({ field }) => field === 'isVerifiedAsEffective'
    );

    const { newValue } = diff;
    let message;

    if (newValue === true) {
      const { newValue:isVerifiedAsEffective } = effectiveDiff || {};
      const { newValue:comments } = commentsDiff || {};

      if (isVerifiedAsEffective === true) {
        message = 'Action verified as effective';
      } else {
        message = 'Action verification failed';
      }

      message = comments ? `${message}: ${comments}` : message;
    } else if (newValue === false) {
      message = 'Verification canceled';
    }

    if (!message) {
      return;
    }

    const logData = { message };
    if (newValue === true) {
      const { newValue:executor } = verifiedByDiff;
      const { newValue:date } = verifiedAtDiff;
      _(logData).extend({ date, executor });
    }

    this._createLog(logData);

    diff.isProcessed = true;
    verifiedAtDiff.isProcessed = true;
    verifiedByDiff.isProcessed = true;
    commentsDiff && (commentsDiff.isProcessed = true);
    effectiveDiff && (effectiveDiff.isProcessed = true);
  }

  _linkedDocChanged(diff) {
    const { ITEM_ADDED, ITEM_REMOVED } = this.constructor._changesTypes;

    const { sequentialId, title } = this._newDoc;
    const actionName = `${sequentialId} "${title}"`;

    const { field, kind, item:linkedDoc } = diff;
    let message, linkedDocMessage;

    if (kind === ITEM_ADDED) {
      message = 'Document was linked to [docName]';
      linkedDocMessage = `${actionName} was linked to this document`;
    } else if (kind === ITEM_REMOVED) {
      message = 'Document was unlinked from [docName]';
      linkedDocMessage = `${actionName} was unlinked from this document`;
    }

    if (!(_(linkedDoc).isObject() && message && linkedDocMessage)) {
      return;
    }

    const { documentId, documentType } = linkedDoc;
    const docCollections = {
      [ProblemTypes.NC]: NonConformities,
      [ProblemTypes.RISK]: Risks
    };
    const docCollection = docCollections[documentType];
    const doc = docCollection.findOne({ _id: documentId });

    const docName = (doc && `${doc.sequentialId} "${doc.title}"`) || documentId;
    message = message.replace('[docName]', docName);

    this._createLog({ message, field });

    const collectionNames = {
      [ProblemTypes.NC]: CollectionNames.NCS,
      [ProblemTypes.RISK]: CollectionNames.RISKS
    };
    this._createLog({
      collection: collectionNames[documentType],
      message: linkedDocMessage,
      documentId
    });

    diff.isProcessed = true;
  }

  _statusChanged(diff) {
    this._prettifyValues(diff, val => ActionStatuses[val]);
  }

  static get _fieldLabels() {
    const fieldLabels = {
      completedAt: 'Completed at',
      completedBy: 'Completed by',
      completionComments: 'Completion comments',
      completionTargetDate: 'Completion target date',
      isCompleted: 'Completed',
      isVerified: 'Verified',
      isVerifiedAsEffective: 'Verified as effective',
      linkedTo: 'Linked to',
      planInPlace: 'Plan in place',
      sequentialId: 'Sequential ID',
      serialNumber: 'Serial number',
      status: 'Status',
      title: 'Title',
      toBeCompletedBy: 'Completion executor',
      toBeVerifiedBy: 'Verification executor',
      type: 'Type',
      verificationComments: 'Verification comments',
      verificationTargetDate: 'Verification target date',
      verifiedAt: 'Verified at',
      verifiedBy: 'Verified by'
    };

    return _(fieldLabels).extend(super._fieldLabels);
  }

  static get _messages() {
    const { FIELD_ADDED, FIELD_CHANGED, FIELD_REMOVED } = this._changesTypes;

    const messages = {
      completionComments: {
        [FIELD_ADDED]: 'Completion comments set',
        [FIELD_CHANGED]: 'Completion comments changed',
        [FIELD_REMOVED]: 'Completion comments removed'
      },
      verificationComments: {
        [FIELD_ADDED]: 'Verification comments set',
        [FIELD_CHANGED]: 'Verification comments changed',
        [FIELD_REMOVED]: 'Verification comments removed'
      }
    };

    return _(messages).extend(super._messages);
  }

  static get _collection() {
    return CollectionNames.ACTIONS;
  }

}