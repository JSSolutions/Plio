import { Template } from 'meteor/templating';
import get from 'lodash.get';
import curry from 'lodash.curry';

import { AnalysisStatuses } from '/imports/api/constants.js';
import { getTzTargetDate } from '/imports/api/helpers.js';

Template.Subcards_RCA_Edit.viewmodel({
  mixin: ['organization', 'nonconformity', 'date', 'modal'],
  defaultTargetDate() {
    const workflowDefaults = this.organization().workflowDefaults;
    const found = _.keys(workflowDefaults)
                    .find(key => this.magnitude() === key.replace('Nc', ''));
    const workflowDefault = workflowDefaults[found];
    if (workflowDefault) {
      const { timeUnit, timeValue } = workflowDefault;
      const date = moment(new Date());
      date[timeUnit](date[timeUnit]() + timeValue);
      return date.toDate();
    }
  },
  RCALabel: 'Root cause analysis',
  UOSLabel: 'Update of standard(s)',
  magnitude: '',
  analysis: '',
  updateOfStandards: '',
  isAnalysisCompleted() {
    const status = get(this.analysis(), 'status');
    const completed = parseInt(get(_.invert(AnalysisStatuses), 'Completed'), 10);
    return Object.is(status, completed);
  },
  methods() {
    const _id = this._id();
    const { timezone } = this.organization();

    const setKey = curry((key, method) => ({ ...args }, cb) =>
      this.modal().callMethod(method, { _id, [key]: args[key] }, cb));
    const setAssignee = curry((key, method) => ({ executor }, cb) =>
      this.modal().callMethod(method, { _id, [key]: executor }, cb));
    const setDate = curry((key, method) => ({ date }, cb) =>
      this.modal().callMethod(method, { _id, [key]: getTzTargetDate(date, timezone) }, cb));
    const undo = method => cb =>
      this.modal().callMethod(method, { _id }, cb);

    const {
      setAnalysisExecutor,
      setAnalysisDate,
      completeAnalysis,
      undoAnalysis,
      setStandardsUpdateExecutor,
      setStandardsUpdateDate,
      updateStandards,
      undoStandardsUpdate,
      setAnalysisCompletedBy,
      setAnalysisCompletedDate,
      setAnalysisComments,
      setStandardsUpdateCompletedBy,
      setStandardsUpdateCompletedDate,
      setStandardsUpdateComments
    } = this.methodRefs();

    const half = {
      setExecutor: setAssignee('executor'),
      setDate: setDate('targetDate'),
      setCompletedBy: setAssignee('completedBy'),
      setCompletedDate: setDate('completedAt'),
      setComments: setKey('completionComments'),
      complete: setKey('completionComments'),
      undo: undo
    };

    const makeMethods = (methods, from) => methods.map((ref, i) => {
      const key = Object.keys(from)[i];
      return { [key]: () => from[key](ref) };
    }).reduce((prev, cur) => ({ ...prev, ...cur }), {});

    return {
      Analysis: () => makeMethods([
        setAnalysisExecutor,
        setAnalysisDate,
        setAnalysisCompletedBy,
        setAnalysisCompletedDate,
        setAnalysisComments,
        completeAnalysis,
        undoAnalysis,
      ], half),
      UpdateOfStandards: () => makeMethods([
        setStandardsUpdateExecutor,
        setStandardsUpdateDate,
        setStandardsUpdateCompletedBy,
        setStandardsUpdateCompletedDate,
        setStandardsUpdateComments,
        updateStandards,
        undoStandardsUpdate,
      ], half)
    };
  },
  update({ query = {}, options = {}, ...args }, cb) {
    const allArgs = { ...args, options, query };

    this.parent().update(allArgs, cb);
  }
});
