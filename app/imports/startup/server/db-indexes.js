import { Departments } from '/imports/share/collections/departments.js';
import { LessonsLearned } from '/imports/share/collections/lessons.js';
import { Organizations } from '/imports/share/collections/organizations.js';
import { StandardsBookSections } from '/imports/share/collections/standards-book-sections.js';
import { StandardTypes } from '/imports/share/collections/standards-types.js';
import { Standards } from '/imports/share/collections/standards.js';
import { NonConformities } from '/imports/share/collections/non-conformities.js';
import { Occurrences } from '/imports/share/collections/occurrences.js';
import { Messages } from '/imports/share/collections/messages.js';


// indexes for Departments
Departments._ensureIndex({
  organizationId: 1
});


// indexes for LessonsLearned
LessonsLearned._ensureIndex({
  organizationId: 1
});


// indexes for Organizations
Organizations._ensureIndex({
  serialNumber: 1
});

Organizations._ensureIndex({
  name: 1
});

Organizations._ensureIndex({
  'users.userId': 1
});

Organizations._ensureIndex({
  'users.role': 1
});

Organizations._ensureIndex({
  'users.isRemoved': 1
});


// indexes for StandardsBookSections
StandardsBookSections._ensureIndex({
  organizationId: 1
});


// indexes for StandardTypes
StandardTypes._ensureIndex({
  organizationId: 1
});


// indexes for Standards
Standards._ensureIndex({
  organizationId: 1
});

Standards._ensureIndex({
  isDeleted: 1
});

Standards._ensureIndex({
  viewedBy: 1
});

// indexes for NonConformities
NonConformities._ensureIndex({
  organizationId: 1
});

NonConformities._ensureIndex({
  isDeleted: 1
});

NonConformities._ensureIndex({
  viewedBy: 1
});

NonConformities._ensureIndex({
  title: 1
});

NonConformities._ensureIndex({
  sequentialId: 1
});

NonConformities._ensureIndex({
  departmentsIds: 1
});

NonConformities._ensureIndex({
  standardsIds: 1
});

NonConformities._ensureIndex({
  status: 1
});

NonConformities._ensureIndex({
  magnitude: 1
});

NonConformities._ensureIndex({
  sequentialId: 1,
  title: 1
});


// indexes for Occurrences
Occurrences._ensureIndex({
  nonConformityId: 1
});

// indexes for Risks
Risks._ensureIndex({
  organizationId: 1
});

Risks._ensureIndex({
  isDeleted: 1
});

Risks._ensureIndex({
  viewedBy: 1
});

Risks._ensureIndex({
  title: 1
});

Risks._ensureIndex({
  sequentialId: 1
});

Risks._ensureIndex({
  scores: 1
});

Risks._ensureIndex({
  departmentsIds: 1
});

Risks._ensureIndex({
  standardsIds: 1
});

Risks._ensureIndex({
  status: 1
});

Risks._ensureIndex({
  magnitude: 1
});

Risks._ensureIndex({
  sequentialId: 1,
  title: 1
});

// Messages indexes

Messages._ensureIndex({
  discussionId: 1
});

Messages._ensureIndex({
  createdAt: 1
});

Messages._ensureIndex({
  discussionId: 1,
  createdAt: 1
});

Messages._ensureIndex({
  discussionId: 1,
  createdAt: -1
});
