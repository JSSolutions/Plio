import { ChangesKinds } from '../../../utils/changes-kinds.js';
import { getUserFullNameOrEmail } from '../../../utils/helpers.js';
import { getReceivers } from '../helpers.js';


export default {
  field: 'completionComments',
  logs: [
    {
      shouldCreateLog({ diffs: { isCompleted } }) {
        return !isCompleted;
      },
      message: {
        [ChangesKinds.FIELD_ADDED]: 'Completion comments set',
        [ChangesKinds.FIELD_CHANGED]: 'Completion comments changed',
        [ChangesKinds.FIELD_REMOVED]: 'Completion comments removed'
      }
    }
  ],
  notifications: [
    {
      shouldSendNotification({ diffs: { isCompleted } }) {
        return !isCompleted;
      },
      text: {
        [ChangesKinds.FIELD_ADDED]:
          '{{userName}} set completion comments of {{{docDesc}}}',
        [ChangesKinds.FIELD_CHANGED]:
          '{{userName}} changed completion comments of {{{docDesc}}}',
        [ChangesKinds.FIELD_REMOVED]:
          '{{userName}} removed completion comments of {{{docDesc}}}'
      }
    }
  ],
  data({ diffs: { completionComments }, newDoc, user }) {
    const { newValue, oldValue } = completionComments;
    const auditConfig = this;

    return {
      docDesc: () => auditConfig.docDescription(newDoc),
      userName: () => getUserFullNameOrEmail(user),
      newValue: () => newValue,
      oldValue: () => oldValue
    };
  },
  receivers: getReceivers
};
