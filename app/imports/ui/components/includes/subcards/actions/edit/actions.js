import { Template } from 'meteor/templating';
import pluralize from 'pluralize';

import { ActionTypes, ProblemTypes } from '/imports/api/constants.js';
import { NonConformities } from '/imports/api/non-conformities/non-conformities.js';
import { Risks } from '/imports/api/risks/risks.js';
import {
  insert,
  update,
  remove,
  complete,
  verify,
  undoCompletion,
  undoVerification,
  linkStandard,
  unlinkStandard,
  linkProblem,
  unlinkProblem
} from '/imports/api/actions/methods.js';


Template.Subcards_Actions_Edit.viewmodel({
  mixin: ['modal', 'addForm', 'organization', 'date', 'actionStatus', 'action'],
  type: '',
  title() {
    return pluralize(this._getNameByType(this.type()));
  },
  addButtonText() {
    let buttonText = '';
    switch (this.type()) {
      case ActionTypes.CORRECTIVE_ACTION:
        buttonText = 'Add corrective action';
        break;
      case ActionTypes.PREVENTATIVE_ACTION:
        buttonText = 'Add preventative action';
        break;
      case ActionTypes.RISK_CONTROL:
        buttonText = 'Add risk control';
        break;
    }
    return buttonText;
  },
  lText(action) {
    const { sequentialId, title } = action;
    return `<strong>${sequentialId}</strong> ${title}`;
  },
  rText(action) {
    const { isCompleted, completedAt, completionTargetDate, status } = action;

    let date = (isCompleted && completedAt) ? completedAt : completionTargetDate;
    date = this.renderDate(date);

    let indicatorClass = this.getClassByStatus(status);

    return `<span class="hidden-xs-down">${date}</span>
           <i class="fa fa-circle text-${indicatorClass} margin-left"></i>`;
  },
  newSubcardTitle() {
    let newSubcardTitle = '';
    switch (this.type()) {
      case ActionTypes.CORRECTIVE_ACTION:
        newSubcardTitle = 'New corrective action';
        break;
      case ActionTypes.PREVENTATIVE_ACTION:
        newSubcardTitle = 'New preventative action';
        break;
      case ActionTypes.RISK_CONTROL:
        newSubcardTitle = 'New risk control';
        break;
    }
    return newSubcardTitle;
  },
  actions() {
    const actionType = this.type();
    const query = {
      type: actionType
    };

    const documentId = this.documentId && this.documentId();
    const documentType = this.documentType && this.documentType();
    const standardId = this.standardId && this.standardId();

    if (documentId && documentType) {
      _.extend(query, {
        'linkedProblems.problemId': documentId,
        'linkedProblems.problemType': documentType
      });
    } else if (standardId) {
      const NCsIds = _.pluck(
        NonConformities.find({ standardsIds: standardId }).fetch(),
        '_id'
      );

      const risksIds = _.pluck(
        Risks.find({ standardsIds: standardId }).fetch(),
        '_id'
      );

      _.extend(query, {
        $or: [{
          'linkedProblems.problemId': { $in: NCsIds },
          'linkedProblems.problemType': ProblemTypes.NC
        }, {
          'linkedProblems.problemId': { $in: risksIds },
          'linkedProblems.problemType': ProblemTypes.RISK
        }]
      });
    }

    return this._getActionsByQuery(query, { sort: { sequentialId: 1 } });
  },
  addAction() {
    const newSubcardData = {
      content: 'Actions_AddSubcard',
      _lText: this.newSubcardTitle(),
      type: this.type(),
      insertFn: this.insertFn(),
      removeFn: this.removeFn(),
      updateFn: this.updateFn()
    };

    const documentId = this.documentId && this.documentId();
    const documentType = this.documentType && this.documentType();

    if (documentId && documentType) {
      _.extend(newSubcardData, {
        documentId,
        documentType,
        linkedProblems: [{
          problemId: documentId,
          problemType: documentType
        }]
      });
    }

    this.addForm('SubCardEdit', newSubcardData);
  },
  insertFn() {
    return this.insert.bind(this);
  },
  insert({ _id, ...args }, cb) {
    if (_id) {
      const documentId = this.documentId && this.documentId();
      const documentType = this.documentType && this.documentType();

      this.modal().callMethod(linkProblem, {
        _id,
        problemId: documentId,
        problemType: documentType
      }, cb);
    } else {
      const organizationId = this.organizationId();

      this.modal().callMethod(insert, {
        organizationId,
        type: this.type(),
        ...args
      }, cb);
    }
  },
  updateFn() {
    return this.update.bind(this);
  },
  update({ ...args }, cb) {
    this.modal().callMethod(update, { ...args }, cb);
  },
  remove(viewmodel) {
    const _id = viewmodel._id && viewmodel._id();

    const { title } = viewmodel.getData();

    if (!_id) {
      return viewmodel.destroy();
    } else {
      swal({
        title: 'Are you sure?',
        text: `The action "${title}" will be removed.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remove',
        closeOnConfirm: false
      }, () => {
        const cb = (err, res) => {
          if (!err) {
            viewmodel.destroy();
            swal(
              'Removed!',
              `The action "${title}" was removed successfully.`,
              'success'
            );
          }
        };

        this.modal().callMethod(remove, { _id }, cb);
      });
    }
  },
  removeFn() {
    return this.remove.bind(this);
  },
  completeFn() {
    return this.complete.bind(this);
  },
  complete({ ...args }, cb) {
    this.modal().callMethod(complete, { ...args }, cb);
  },
  undoCompletionFn() {
    return this.undoCompletion.bind(this);
  },
  undoCompletion({ ...args }, cb) {
    this.modal().callMethod(undoCompletion, { ...args }, cb);
  },
  verifyFn() {
    return this.verify.bind(this);
  },
  verify({ ...args }, cb) {
    this.modal().callMethod(verify, { ...args }, cb);
  },
  undoVerificationFn() {
    return this.undoVerification.bind(this);
  },
  undoVerification({ ...args }, cb) {
    this.modal().callMethod(undoVerification, { ...args }, cb);
  },
  linkProblemFn() {
    return this.linkProblem.bind(this);
  },
  linkProblem({ ...args }, cb) {
    this.modal().callMethod(linkProblem, { ...args }, cb);
  },
  unlinkProblemFn() {
    return this.unlinkProblem.bind(this);
  },
  unlinkProblem({ ...args }, cb) {
    this.modal().callMethod(unlinkProblem, { ...args }, cb);
  }
});
