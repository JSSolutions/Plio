import { CollectionNames } from '../../constants.js';
import AuditService from '/imports/core/server/audit/audit-service.js';
import RiskUpdateAudit from './RiskUpdateAudit.js';


export default _.extend({}, AuditService, {
  _collection: CollectionNames.RISKS,

  _updateAuditConstructor: RiskUpdateAudit,

  _onDocumentCreated(newDocument, userId) {
    const { standardsIds, createdAt, createdBy, sequentialId, title } = newDocument;

    const logs = [];
    const logMessage = `${sequentialId} "${title}" linked`;

    _(standardsIds).forEach((standardId) => {
      logs.push({
        collection: CollectionNames.STANDARDS,
        message: logMessage,
        documentId: standardId,
        date: createdAt,
        executor: createdBy
      });
    });

    this._saveLogs(logs);
  }
});
