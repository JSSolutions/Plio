import React, { PropTypes } from 'react';
import { ListGroup } from 'reactstrap';

import { DocumentTypes } from '/imports/share/constants';
import LHSContainer from '../../../containers/LHSContainer';
import SectionListContainer from '../../containers/SectionListContainer';
import TypeListContainer from '../../containers/TypeListContainer';
import DeletedStandardListContainer from '../../containers/DeletedStandardListContainer';
import ModalHandle from '../../../components/ModalHandle';
import ModalBulkImport from '../../../components/ModalBulkImport';
import AddButton from '../../../components/Buttons/AddButton';

const propTypes = {
  filter: PropTypes.number,
  standards: PropTypes.arrayOf(PropTypes.object),
  onToggleCollapse: PropTypes.func,
  animating: PropTypes.bool,
  searchText: PropTypes.string,
  searchResultsText: PropTypes.string,
  onSearchTextChange: PropTypes.func,
  onClear: PropTypes.func,
  onModalOpen: PropTypes.func,
};

const StandardsLHS = ({
  filter,
  standards,
  onToggleCollapse,
  animating,
  searchText,
  searchResultsText,
  onSearchTextChange,
  onClear,
  onModalOpen,
}) => {
  let content;
  let AddButtonComponent = undefined;

  standards = []; // TEMP

  if (!standards.length) {
    const openByClickOn = (
      <AddButton>Add</AddButton>
    );

    AddButtonComponent = () => (
      <ModalHandle closeOnEsc closeOnOutsideClick title="Add" {...{ openByClickOn }}>
        <ModalBulkImport documentType={DocumentTypes.STANDARD} />
      </ModalHandle>
    );
  }

  switch (filter) {
    case 1:
    default:
      content = (
        <SectionListContainer {...{ standards, onToggleCollapse }} />
      );
      break;
    case 2:
      content = (
        <TypeListContainer {...{ standards, onToggleCollapse }} />
      );
      break;
    case 3:
      content = (
        <ListGroup>
          <DeletedStandardListContainer {...{ standards }} />
        </ListGroup>
      );
      break;
  }

  return (
    <LHSContainer
      {...{ animating, searchText, searchResultsText, onClear, AddButtonComponent }}
      onChange={onSearchTextChange}
      onModalButtonClick={onModalOpen}
    >
      {content}
    </LHSContainer>
  );
};

StandardsLHS.propTypes = propTypes;

export default StandardsLHS;
