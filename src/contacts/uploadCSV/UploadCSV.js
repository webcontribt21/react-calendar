/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiUploadOutline,
  mdiCloudUploadOutline,
  mdiFileOutline,
  mdiChevronLeft,
} from '@mdi/js';
import { useDropzone } from 'react-dropzone';
import NProgress from 'nprogress';
import Papa from 'papaparse';
import { AuthContext } from '../../auth/AuthContextService';
import style from './style.module.scss';
import Card from '../../components/card/Card';
import Button from '../../components/button/Button';
import Switch from '../../components/switch/Switch';
import { post } from '../../utils/fetch';
import API from '../../props';
import DataTable from './DataTable';

ReactModal.setAppElement('#kronologic-ai-app');

const UploadCSV = ({ isOpen, onClose, onUpload }) => {
  const { logout } = useContext(AuthContext);
  const [csvHeader, setCSVHeader] = useState(true);
  const [file, setFile] = useState(null);
  const [canUpload, setCanUpload] = useState(false);
  const [headerCSVRow, setHeaderCSVRow] = useState([]);
  const [fieldCount, setFieldCount] = useState(0);
  const [data, setData] = useState([]);
  const [uploadableData, setUploadableData] = useState([]);

  NProgress.configure({
    parent: '#uploadCSV',
  });

  const defaultCSVHeader = useCallback(
    () => [
      { name: 'select header', value: 0 },
      {
        id: 1,
        name: 'first name',
        value: 'firstName',
      },
      {
        id: 2,
        name: 'last name',
        value: 'lastName',
      },
      {
        id: 3,
        name: 'email',
        value: 'email',
      },
      {
        id: 4,
        name: 'account',
        value: 'account',
      },
      {
        id: 5,
        name: 'phone',
        value: 'phone',
      },
      {
        id: 6,
        name: 'Address 1',
        value: 'address1',
      },
      {
        id: 7,
        name: 'Address 2',
        value: 'address2',
      },
      {
        id: 8,
        name: 'zip',
        value: 'zip',
      },
      {
        id: 9,
        name: 'state',
        value: 'state',
      },
      {
        id: 10,
        name: 'country',
        value: 'country',
      },
      {
        id: 11,
        name: 'logic field',
        value: 'logic_field',
      },
      {
        id: 12,
        name: 'routing field',
        value: 'routing_field',
      },
      {
        id: 13,
        name: 'lead score',
        value: 'lead_score',
      },
    ],
    [],
  );

  const uploadContacts = useCallback(async () => {
    if (canUpload) {
      NProgress.start(0.7);
      setCanUpload(false);

      const response = await post(API.contacts.csv, null, {
        data: uploadableData,
        headers: headerCSVRow,
      })
        .then(res => res)
        .catch(e => {
          if (e.message === '401') {
            logout();
          }
        });

      setCanUpload(true);
      NProgress.done();
      onUpload(uploadableData.length, response.status);
    }
  }, [canUpload, headerCSVRow, logout, onUpload, uploadableData]);

  const handleClose = useCallback(() => {
    setFile(null);
    setHeaderCSVRow([]);
    setData([]);
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const parsedData = [];

    if (file) {
      Papa.parse(file, {
        chunkSize: 100,
        complete: () => {
          const count = parsedData[0].length;
          setFieldCount(count);

          if (csvHeader) {
            setData(parsedData.slice(1, parsedData.length));
          } else {
            setData(parsedData);
          }
        },
        download: true,
        dynamicTyping: false,
        skipEmptyLines: 'greedy',
        // dynamicTyping: true,
        step: row => {
          parsedData.push(row.data);
        },
        worker: true,
      });
    }
  }, [file, csvHeader]);

  const toggleHasHeader = useCallback(() => {
    setCSVHeader(!csvHeader);
  }, [csvHeader]);

  const onDrop = useCallback(selectedFile => {
    if (selectedFile && selectedFile.length) {
      setFile(selectedFile[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.csv',
    onDrop,
  });

  const UploadModalHeader = () => {
    return (
      <div className={style.modalHeader}>
        <Icon path={mdiUploadOutline} size={3} />
        <span>Upload CSV</span>
        <div className={style.headerActions}>
          <span>has header</span>
          <Switch isOn={csvHeader} handleToggle={toggleHasHeader} />
        </div>
      </div>
    );
  };

  const dataTableOnchange = useCallback(
    headers => {
      const hrs = headers.filter(hr => hr.value !== 0);
      const indeces = headers.reduce((a, e, i) => {
        if (e.value === 0) a.push(i);
        return a;
      }, []);

      if (hrs.length) {
        setHeaderCSVRow(hrs.map(hr => hr.value));
        let dataToUpload = [];

        data.forEach(row => {
          const newRow = [...row];
          indeces.forEach((item, index) =>
            newRow.splice(item - index, 1),
          );

          dataToUpload = [...dataToUpload, newRow];
        });

        setUploadableData(dataToUpload);
      }

      setCanUpload(hrs.length > 0);
    },
    [data],
  );

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modal--content"
      overlayClassName="modal--overlay"
      shouldCloseOnOverlayClick={false}
    >
      <section className={cx('container is--fluid', style.uploadCSV)}>
        <div className="row">
          <div className="col-1 col-offset-11">
            <Icon
              path={mdiClose}
              size={2}
              className={style.close}
              onClick={handleClose}
            />
          </div>
        </div>
        <div className="row">
          {!file && (
            <div className="col-6 col-offset-3">
              <Card header={<UploadModalHeader />}>
                <div className="row">
                  <div className="col-12">
                    <div className={style.dropzone}>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className={style.uploadContents}>
                          <Icon
                            path={mdiCloudUploadOutline}
                            size={5}
                            className={style.cloudIcon}
                          />
                          <span>
                            Drag &amp; drop, or click here to select
                            file
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
          {file && data && data.length && (
            <div id="uploadCSV" className="col-6 col-offset-3">
              <Card header="Selected file" icon={mdiFileOutline}>
                <div className="row">
                  <div className="col-12">
                    <div className={style.selectedFile}>
                      <span>{file.name}</span>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className={style.fileData}>
                      <DataTable
                        onChange={dataTableOnchange}
                        fieldCount={fieldCount}
                        headers={defaultCSVHeader()}
                        sampleRow={data[0]}
                      />
                    </div>
                    <hr />
                  </div>
                </div>
                <div className="row">
                  <div className={cx('col-12', style.actions)}>
                    <Button
                      icon={mdiChevronLeft}
                      type="text"
                      onClick={() => setFile(null)}
                    >
                      <span>Change File</span>
                    </Button>
                    <Button
                      disabled={!canUpload}
                      icon={mdiUploadOutline}
                      type="primary"
                      onClick={uploadContacts}
                    >
                      <span>Upload</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>
    </ReactModal>
  );
};

UploadCSV.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onUpload: PropTypes.func,
};

UploadCSV.defaultProps = {
  isOpen: false,
  onClose: () => {},
  onUpload: () => {},
};

export { UploadCSV as default };
