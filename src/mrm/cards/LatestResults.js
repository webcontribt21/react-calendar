import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveBar } from '@nivo/bar';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import { formatThousands } from '../../utils/format';

const LatestResults = ({
  cancelled,
  declined,
  accepted,
  rui,
  pending,
}) => {
  return (
    <Card className={[style.card]}>
      <div className={style.content}>
        <header className={style.title}>
          <h3>Latest Results</h3>
        </header>
        <div className={style.chart}>
          <ResponsiveBar
            colors={{ scheme: 'blues' }}
            colorBy={node => {
              if (node.id === 'accepted') {
                return 'accepted';
              }
              return node.id;
            }}
            margin={{ bottom: 50, left: 60, right: 10, top: 10 }}
            padding={0.3}
            layout="horizontal"
            data={[
              { lbl: 'Pending', pending, status: 'Pending' },
              { declined, lbl: 'Declined', status: 'Declined' },
              {
                lbl: 'Requires User Intervention',
                rui,
                status: 'RUI',
              },
              { accepted, lbl: 'Accepted', status: 'Accepted' },
            ]}
            keys={['accepted', 'declined', 'pending', 'rui']}
            indexBy="status"
            legends={[
              {
                anchor: 'bottom',
                dataFrom: 'keys',
                direction: 'row',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
                itemDirection: 'left-to-right',
                itemHeight: 20,
                itemOpacity: 0.85,
                itemWidth: 100,
                itemsSpacing: 20,
                justify: false,
                symbolSize: 20,
                translateX: -1,
                translateY: 50,
              },
            ]}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 1.6]],
            }}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.6]],
            }}
            tooltip={node => {
              return `${node.data.lbl}: ${node.value}`;
            }}
            animate
            motionStiffness={90}
            motionDamping={15}
          />
        </div>
      </div>
    </Card>
  );
};

LatestResults.propTypes = {
  accepted: PropTypes.number,
  cancelled: PropTypes.number,
  declined: PropTypes.number,
  pending: PropTypes.number,
  rui: PropTypes.number,
};

LatestResults.defaultProps = {
  accepted: 0,
  cancelled: 0,
  declined: 0,
  pending: 0,
  rui: 0,
};

export { LatestResults as default };
