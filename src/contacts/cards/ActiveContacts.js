import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ResponsiveWaffle } from '@nivo/waffle';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { formatThousands } from '../../utils/format';

const ActiveContacts = ({ active, count }) => {
  if (!active) {
    return null;
  }

  return (
    <Card className={[style.card]}>
      <div className={style.content}>
        {count > 0 && (
          <div className={style.chart}>
            <ResponsiveWaffle
              data={[
                {
                  id: 'active',
                  label: 'active',
                  value: active,
                },
              ]}
              total={count}
              rows={10}
              columns={10}
              colors={{ scheme: 'paired' }}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 0.1]],
              }}
              animate
              motionStiffness={90}
              motionDamping={11}
            />
          </div>
        )}
        <header>
          <h3>
            {!active ? 0 : formatThousands(active)[0]}
            <span>{!active ? null : formatThousands(active)[1]}</span>
          </h3>
        </header>
        <div className={cx(style.subHeader)}>active contacts</div>
      </div>
    </Card>
  );
};

ActiveContacts.propTypes = {
  active: PropTypes.number,
  count: PropTypes.number,
};

ActiveContacts.defaultProps = {
  active: 0,
  count: 0,
};

export { ActiveContacts as default };
