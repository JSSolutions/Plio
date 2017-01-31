import { batchActions } from 'redux-batched-actions';

import { BackgroundSubs } from '/imports/startup/client/subsmanagers';
import { Departments } from '/imports/share/collections/departments';
import { NonConformities } from '/imports/share/collections/non-conformities';
import { Risks } from '/imports/share/collections/risks';
import { Actions } from '/imports/share/collections/actions';
import { Standards } from '/imports/share/collections/standards';
import {
  setDepartments,
  setNCs,
  setRisks,
  setActions,
  setStandards,
} from '/imports/client/store/actions/collectionsActions';
import { setDepsReady } from '/imports/client/store/actions/risksActions';

export default function loadDeps({ dispatch, organizationId, initializing }, onData) {
  const subscription = BackgroundSubs.subscribe('risksDeps', organizationId);

  if (subscription.ready()) {
    const query = { organizationId };
    const pOptions = { sort: { serialNumber: 1 } };
    const departments = Departments.find(query, { sort: { name: 1 } }).fetch();
    const ncs = NonConformities.find(query, pOptions).fetch();
    const standards = Standards.find(query, pOptions).fetch();
    const actions = Actions.find(query, pOptions).fetch();

    let reduxActions = [
      setDepartments(departments),
      setNCs(ncs),
      setStandards(standards),
      setActions(actions),
      setDepsReady(true),
    ];

    if (initializing) {
      // set risks only when initializing because
      // later observers will be running
      const risks = Risks.find(query, { sort: { title: 1 } }).fetch();

      reduxActions = reduxActions.concat(setRisks(risks));
    }

    dispatch(batchActions(reduxActions));
  }

  onData(null, {});

  return () => typeof subscription === 'function' && subscription.stop();
}
