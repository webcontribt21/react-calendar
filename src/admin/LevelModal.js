import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { levels } from './props';

ReactModal.setAppElement('#kronologic-ai-app');

const componentMapping = {
  [levels.SOURCE]: lazy(() =>
    import('./levels/source/SourceContent'),
  ),
  [levels.CHANNELS]: lazy(() =>
    import('./levels/source/SourceContent'),
  ),
  [levels.MICROJOBS]: lazy(() =>
    import('./levels/source/SourceContent'),
  ),
  [levels.USERS]: lazy(() => import('./levels/source/SourceContent')),
};

const LevelModal = ({ isOpen, onClose, content }) => {
  const [Component, setComponent] = useState('');

  useEffect(() => {
    if (content) {
      setComponent(componentMapping[content]);
    }
  }, [content]);

  // TODO Provide a fallback instead of just a div element.
  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal--content"
      overlayClassName="modal--overlay"
      shouldCloseOnOverlayClick={false}
    >
      <Suspense fallback={<div>...loading</div>}>
        <Component close={onClose} />
      </Suspense>
    </ReactModal>
  );
};

LevelModal.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

LevelModal.defaultProps = {
  content: null,
  isOpen: false,
  onClose: () => {},
};

export { LevelModal as default };
