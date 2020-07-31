import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import style from './contacts.module.scss';
import useFetch from '../hooks/useFetch';
import { Flux, FluxItem, Group, TimeLine } from './timeline/Timeline';
import { groupBy } from '../utils/array';

const ContactHistory = ({ id }) => {
  const { response, error } = useFetch(
    `http://localhost:8000/backend/activities/${id}`,
  );

  if (response) {
    const { activities } = response;

    let grouped = groupBy(activities, 'formatted_date_short');

    grouped = Object.keys(grouped)
      .sort((a, b) => {
        return +b - +a;
      })
      .map(k => ({
        key: k,
        value: grouped[k],
      }));

    return (
      <TimeLine>
        {grouped.map(({ key, value }) => {
          return (
            <Group key={`group-id-${key}`} tag={key}>
              {value
                .reverse()
                .map(
                  (
                    {
                      id: activityId,
                      type,
                      text: status,
                      subtext: statusValue,
                      properties,
                      formatted_date_short: date,
                      formatted_time: time,
                    },
                    i,
                  ) => {
                    return (
                      <Flux
                        key={`flux-${activityId}`}
                        header={`${time}`}
                        status={status}
                      >
                        <FluxItem
                          id={activityId}
                          labels={properties || statusValue}
                        />
                      </Flux>
                    );
                  },
                )}
            </Group>
          );
        })}
      </TimeLine>
    );
  }

  return <div>{id}</div>;
};

ContactHistory.propTypes = {
  id: PropTypes.number.isRequired,
};

export default ContactHistory;
