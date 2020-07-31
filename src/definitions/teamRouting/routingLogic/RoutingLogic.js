/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiClose, mdiPlus, mdiMinus } from '@mdi/js';
import style from './style.module.scss';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';
import Dropdown from '../../../components/dropdown/Dropdown';

ReactModal.setAppElement('#kronologic-ai-app');

const conditionTypes = {
  CONTAINS: 'contains',
  IS: 'is',
  NOT: 'is_not',
  NOT_CONTAIN: 'does_not_contain',
};

const mappings = {
  [conditionTypes.CONTAINS]: 'contains',
  [conditionTypes.IS]: 'is',
  [conditionTypes.NOT]: 'is not',
  [conditionTypes.NOT_CONTAIN]: 'does not contain',
};

const fields = [
  'account',
  'email',
  'first_name',
  'last_name',
  'lead_score',
  'logic_field',
  'phone',
  'routing_field',
  'state',
  'zip_code',
];

function RoutingLogic({
  isOpen,
  onAdd,
  onChange,
  onClose,
  onRemove,
  onSelect,
  conditions,
}) {
  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal--content"
      overlayClassName="modal--overlay"
      shouldCloseOnOverlayClick={false}
    >
      <section
        className={cx('container is--fluid', style.routingLogic)}
      >
        <div className="row">
          <div className="col-1 col-offset-9">
            <Icon
              path={mdiClose}
              size={2}
              className={style.close}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-6 col-offset-3">
            <Card>
              <div className={style.actions}>
                <Button icon={mdiPlus} onClick={onAdd}>
                  <span>Filter</span>
                </Button>
              </div>
              {conditions.map(condition => {
                return (
                  <div
                    key={`condition-${condition.id}`}
                    className={style.condition}
                  >
                    <div className="form--inline">
                      <label>
                        <Dropdown
                          label="Select Field"
                          labelProp="value"
                          valueProp="value"
                          data={fields.map(key => ({
                            value: key,
                          }))}
                          onSelect={value =>
                            onSelect(
                              condition?.id,
                              'field',
                              value?.value,
                            )
                          }
                          selectItem={condition.field}
                        />
                      </label>
                      <label>
                        <Dropdown
                          label="Select Operator"
                          labelProp="value"
                          valueProp="id"
                          data={Object.keys(mappings).map(key => ({
                            id: key,
                            value: mappings[key],
                          }))}
                          onSelect={value =>
                            onSelect(
                              condition?.id,
                              'operator',
                              value?.id,
                            )
                          }
                          selectItem={condition.operator}
                        />
                      </label>
                      <label>
                        <input
                          type="text"
                          name="value"
                          value={condition.value}
                          data-id={condition.id}
                          placeholder="value"
                          onChange={onChange}
                        />
                      </label>
                      <Button
                        icon={mdiMinus}
                        type="secondary"
                        onClick={() => onRemove(condition.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </section>
    </ReactModal>
  );
}

RoutingLogic.propTypes = {
  conditions: PropTypes.arrayOf(PropTypes.any),
  isOpen: PropTypes.bool,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onRemove: PropTypes.func,
  onSelect: PropTypes.func,
};

RoutingLogic.defaultProps = {
  conditions: [],
  isOpen: false,
  onAdd: () => {},
  onChange: () => {},
  onClose: () => {},
  onRemove: () => {},
  onSelect: () => {},
};

export { RoutingLogic as default };
