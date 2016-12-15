import React, { PropTypes } from 'react';

import Button from '../../../../components/Buttons/Button';
import Icon from '../../../../components/Icon';

const LinkItem = ({ href, indicator, title, sequentialId }) => (
  <Button
    href={href}
    type="secondary"
    className="btn-inline pointer"
  >
    {sequentialId && (<strong>{sequentialId} </strong>)}

    <span>{title}</span>

    {indicator && (
      <Icon
        names="circle"
        margin="left"
        className={`text-${indicator}`}
      />
    )}
  </Button>
);

LinkItem.propTypes = {
  href: PropTypes.string,
  indicator: PropTypes.string,
  title: PropTypes.string,
  sequentialId: PropTypes.string,
};

export default LinkItem;
