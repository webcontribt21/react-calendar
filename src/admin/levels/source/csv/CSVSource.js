import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import cx from 'classnames';
import Icon from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';
import style from './csvSource.module.scss';

const CSVSource = () => {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <section className={cx('container is--fluid', style.csvSource)}>
      <div className="row">
        <form className="col-12">
          <label htmlFor="channel">
            Channel
            <div className="select-wrapper">
              <select name="channel" className="fluid">
                <option value="-1">choose a chanel</option>
                <option value="1">channel 1</option>
              </select>
              <Icon path={mdiChevronDown} size={1} />
            </div>
          </label>
          <label htmlFor="description">
            Description
            <input
              name="description"
              type="text"
              className="fluid"
              placeholder="csv file description"
            />
          </label>
        </form>
      </div>
      <div className="row">
        <div className="col-12">
          <div {...getRootProps()} className={style.zone}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag n drop some files here, or click to select files
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CSVSource;
