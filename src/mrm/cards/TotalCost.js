import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { formatCurrency } from '../../utils/format';

const TotalCount = ({ count }) => {
  return (
    <Card className={[style.card]}>
      <div className={style.content}>
        <header>
          <h3>{formatCurrency(count, 0)}</h3>
        </header>
        <div className={style.subHeader}>total value</div>
      </div>
    </Card>
  );
};

TotalCount.propTypes = {
  count: PropTypes.number,
};

TotalCount.defaultProps = {
  count: 0,
};

export { TotalCount as default };
