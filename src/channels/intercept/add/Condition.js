/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { mdiMinus, mdiPlus } from '@mdi/js';
import style from './style.module.scss';
import Card from '../../../components/card/Card';
import Button from '../../../components/button/Button';
import useInput from '../../../hooks/useInput';
import Dropdown from '../../../components/dropdown/Dropdown';

ReactModal.setAppElement('#kronologic-ai-app');

const Condition = ({
  index,
  addConditionFunc,
  delConditionFunc,
  total,
  value,
  fields,
  onChange,
}) => {
  const { values, bind, setValues } = useInput({ ...value });
  const [valueOptions, setValueOptions] = useState([]);

  const onValueSelect = item => {
    setValues({
      ...values,
      value: item.label,
    });
  };

  const onSelectField = item => {
    if (item) {
      const { name, options } = item;

      let newValues = {
        ...values,
        field: name,
      };

      if (options && options.length) {
        setValueOptions(options);
        newValues = {
          ...newValues,
          value: options[0].label,
        };
      } else {
        setValueOptions([]);
        newValues = {
          ...newValues,
          value: '',
        };
      }

      setValues(newValues);
    }
  };

  useEffect(() => {
    const validated = values.field !== '' && values.value !== '';

    if (validated) {
      onChange(index, {
        ...values,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const showAddBttn = total === index + 1;

  return (
    <Card className={[style.condition]}>
      <form>
        <div className="row">
          <div className="col-12">
            <div className="form--inline">
              <label htmlFor="field">
                {fields.length > 0 && (
                  <Dropdown
                    label="Select Field"
                    labelProp="label"
                    valueProp="name"
                    data={fields}
                    onSelect={onSelectField}
                    selectItem={values.field}
                  />
                )}
                {!fields.length && (
                  <input
                    placeholder="field"
                    type="text"
                    name="field"
                    {...bind}
                    value={values.field}
                  />
                )}
              </label>

              <label htmlFor="value">
                {valueOptions.length > 0 ? (
                  <Dropdown
                    label="Select Option"
                    labelProp="label"
                    valueProp="label"
                    data={valueOptions}
                    onSelect={onValueSelect}
                    selectItem={values.value}
                  />
                ) : (
                  <input
                    placeholder="value..."
                    type="text"
                    name="value"
                    {...bind}
                    value={values.value}
                  />
                )}
              </label>
              <div className={style.conditionActions}>
                {showAddBttn && (
                  <Button
                    icon={mdiPlus}
                    type="tertiary"
                    onClick={addConditionFunc}
                  />
                )}
                {index !== 0 && (
                  <Button
                    icon={mdiMinus}
                    type="tertiary"
                    onClick={() => delConditionFunc(index)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

Condition.propTypes = {
  addConditionFunc: PropTypes.func.isRequired,
  delConditionFunc: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object),
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  total: PropTypes.number.isRequired,
  value: PropTypes.objectOf(PropTypes.any).isRequired,
};

Condition.defaultProps = {
  fields: null,
  onChange: () => {},
};

export { Condition as default };
