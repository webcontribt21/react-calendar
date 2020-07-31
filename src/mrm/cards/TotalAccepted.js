import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { formatThousands } from '../../utils/format';

const TotalAccepted = ({ count }) => {
  return (
    <Card className={[style.card]}>
      <div className={style.content}>
        <header>
          <h3>
            {!count ? 0 : formatThousands(count)[0]}
            <span>{!count ? null : formatThousands(count)[1]}</span>
          </h3>
        </header>
        <div className={style.subHeader}>total accepted</div>
      </div>
    </Card>
  );
};

TotalAccepted.propTypes = {
  count: PropTypes.number,
};

TotalAccepted.defaultProps = {
  count: 0,
};

export { TotalAccepted as default };
