import React, { PropTypes } from 'react';

import { propEq } from '/imports/api/helpers';
import CollapseBlock from '../../components/CollapseBlock';

const propTypeItem = PropTypes.shape({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.string.isRequired,
});

const propTypes = {
  collapsed: PropTypes.arrayOf(propTypeItem).isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  children: PropTypes.node,
  lText: PropTypes.string.isRequired,
  rText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  hideRTextOnExpand: PropTypes.bool,
  item: propTypeItem,
};

const LHSItem = ({
  item,
  collapsed,
  onToggleCollapse,
  lText,
  rText,
  hideRTextOnExpand,
  children,
}) => {
  const isCollapsed = !collapsed.find(propEq('key', item.key));

  return (
    <CollapseBlock
      collapsed={isCollapsed}
      onToggleCollapse={e => onToggleCollapse(e, item)}
    >
      <div>
        <h4 className="list-group-item-heading pull-left">{lText}</h4>
        {!!rText && (isCollapsed && !hideRTextOnExpand) && (
          <p
            className="list-group-item-text text-danger pull-right"
          >
            {rText}
          </p>
        )}
      </div>
      <div className="list-group">
        {children}
      </div>
    </CollapseBlock>
  );
};

LHSItem.propTypes = propTypes;

export default LHSItem;
