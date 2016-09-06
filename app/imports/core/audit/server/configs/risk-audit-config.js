import { Risks } from '/imports/api/risks/risks.js';
import {
  CollectionNames,
  RiskEvaluationPriorities,
  RiskEvaluationDecisions
} from '/imports/api/constants.js';
import { getUserFullNameOrEmail, getPrettyOrgDate } from '/imports/api/helpers.js';
import { ChangesKinds } from '../utils/changes-kinds.js';
import problemUpdateHandlers from './problem-update-handlers.js';


const {
  FIELD_ADDED, FIELD_CHANGED, FIELD_REMOVED,
  ITEM_ADDED, ITEM_REMOVED
} = ChangesKinds;

export default RiskAuditConfig = {

  collection: Risks,

  collectionName: CollectionNames.RISKS,

  onCreated: {
    logs: [
      {
        template: 'Document created',
        templateData() { }
      }
    ],
    notifications: []
  },

  updateHandlers: [
    ...problemUpdateHandlers,

    {
      field: 'review.comments',
      logs: [
        {
          template: {
            [FIELD_ADDED]: 'Review comments set',
            [FIELD_CHANGED]: 'Review comments changed',
            [FIELD_REMOVED]: 'Review comments removed'
          },
          templateData() { }
        }
      ],
      notifications: []
    },

    {
      field: 'review.reviewedAt',
      logs: [
        {
          template: {
            [FIELD_ADDED]: 'Review date set to "{{newValue}}"',
            [FIELD_CHANGED]: 'Review date changed from "{{oldValue}}" to "{{newValue}}"',
            [FIELD_REMOVED]: 'Review date removed'
          },
          templateData({ diffs, newDoc }) {
            const { newValue, oldValue } = diffs['review.reviewedAt'];
            const orgId = this.docOrgId(newDoc);

            return {
              newValue: getPrettyOrgDate(newValue, orgId),
              oldValue: getPrettyOrgDate(oldValue, orgId)
            };
          }
        }
      ],
      notifications: []
    },

    {
      field: 'review.reviewedBy',
      logs: [
        {
          template: {
            [FIELD_ADDED]: 'Review executor set to {{newValue}}',
            [FIELD_CHANGED]: 'Review executor changed from {{oldValue}} to {{newValue}}',
            [FIELD_REMOVED]: 'Review executor removed'
          },
          templateData({ diffs, newDoc }) {
            const { newValue, oldValue } = diffs['review.reviewedBy'];

            return {
              newValue: getUserFullNameOrEmail(newValue),
              oldValue: getUserFullNameOrEmail(oldValue)
            };
          }
        }
      ],
      notifications: []
    },

    {
      field: 'riskEvaluation.comments',
      logs: [
        {
          template: {
            [FIELD_ADDED]: 'Risk evaluation comments set',
            [FIELD_CHANGED]: 'Risk evaluation comments changed',
            [FIELD_REMOVED]: 'Risk evaluation comments removed'
          },
          templateData() { }
        }
      ],
      notifications: []
    },

    {
      field: 'riskEvaluation.decision',
      logs: [
        {
          template: {
            [FIELD_ADDED]:
              'Risk evaluation treatment decision set to "{{newValue}}"',
            [FIELD_CHANGED]:
              'Risk evaluation treatment decision changed from "{{oldValue}}" to "{{newValue}}"',
            [FIELD_REMOVED]:
              'Risk evaluation treatment decision removed'
          },
          templateData({ diffs }) {
            const { newValue, oldValue } = diffs['riskEvaluation.decision'];

            return {
              newValue: RiskEvaluationDecisions[newValue],
              oldValue: RiskEvaluationDecisions[oldValue]
            };
          }
        }
      ],
      notifications: []
    },

    {
      field: 'riskEvaluation.prevLossExp',
      logs: [
        {
          template: {
            [FIELD_ADDED]:
              'Risk evaluation previous loss experience set',
            [FIELD_CHANGED]:
              'Risk evaluation previous loss experience changed',
            [FIELD_REMOVED]:
              'Risk evaluation previous loss experience removed'
          },
          templateData() { }
        }
      ],
      notifications: []
    },

    {
      field: 'riskEvaluation.priority',
      logs: [
        {
          template: {
            [FIELD_ADDED]:
              'Risk evaluation treatment priority set to "{{newValue}}"',
            [FIELD_CHANGED]:
              'Risk evaluation treatment priority changed from "{{oldValue}}" to "{{newValue}}"',
            [FIELD_REMOVED]:
              'Risk evaluation treatment priority removed'
          },
          templateData({ diffs }) {
            const { newValue, oldValue } = diffs['riskEvaluation.priority'];

            return {
              newValue: RiskEvaluationPriorities[newValue],
              oldValue: RiskEvaluationPriorities[oldValue]
            };
          }
        }
      ],
      notifications: []
    },

    {
      field: 'typeId',
      logs: [
        {
          template: {
            [FIELD_ADDED]: 'Risk type set to "{{newValue}}"',
            [FIELD_CHANGED]: 'Risk type changed from "{{oldValue}}" to "{{newValue}}"',
            [FIELD_REMOVED]: 'Risk type removed'
          },
          templateData({ diffs: { typeId } }) {
            const { newValue, oldValue } = typeId;
            const { title:newType } = RiskTypes.findOne({ _id: newValue });
            const { title:oldType } = RiskTypes.findOne({ _id: oldValue });

            return {
              newValue: newType,
              oldValue: oldType
            };
          }
        }
      ],
      notifications: []
    }

  ],

  onRemoved: {
    logs: [
      {
        template: 'Document removed',
        templateData() { }
      }
    ],
    notifications: []
  },

  docId({ _id }) {
    return _id;
  },

  docDescription({ sequentialId, title }) {
    return `${sequentialId} "${title}"`;
  },

  docOrgId({ organizationId }) {
    return organizationId;
  },

  docUrl({ _id, organizationId }) {
    const { serialNumber } = Organizations.findOne({ _id: organizationId });

    return Meteor.absoluteUrl(`${serialNumber}/risks/${_id}`);
  }

};
