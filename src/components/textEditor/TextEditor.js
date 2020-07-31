import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import shortid from 'shortid';
import style from './style.module.scss';

const TextEditor = ({ value, onChange, onFocus, height }) => {
  const editor = useRef(null);
  const id = shortid.generate();
  const [instance, setInstance] = useState(null);

  const getValue = useCallback(() => {
    return instance.root.innerHTML;
  }, [instance]);

  const setValue = useCallback(
    text => {
      instance.setContents([]);
      instance.clipboard.dangerouslyPasteHTML(0, text);
      // instance.setText(text);
    },
    [instance],
  );

  useLayoutEffect(() => {
    setInstance(
      new Quill(editor.current, {
        theme: 'snow',
      }),
    );
  }, []);

  useEffect(() => {
    const getSource = (delta, oldDelta, source) => {
      if (source === 'user') {
        onChange(getValue());
      }
    };

    const getPosition = () => onFocus(instance.getSelection().index);

    if (instance) {
      instance.on('text-change', getSource);
      editor.current.addEventListener('click', getPosition);
      editor.current.addEventListener('keyup', getPosition);
    }

    return () => {
      if (instance) {
        instance.off('text-change', getSource);
        instance.root.removeEventListener('click', getPosition);
        instance.root.removeEventListener('keyup', getPosition);
      }
    };
  }, [getValue, instance, onChange, onFocus]);

  useEffect(() => {
    if (value && instance) {
      // setValue(value);
    }
  }, [instance, setValue, value]);

  return (
    <div
      ref={editor}
      id={`editor-${id}`}
      className={style.textEditor}
      style={{ height }}
    >
      {value}
    </div>
  );
};

TextEditor.propTypes = {
  height: PropTypes.number,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  value: PropTypes.string,
};

TextEditor.defaultProps = {
  height: 100,
  onChange: () => {},
  onFocus: () => {},
  value: '',
};

export { TextEditor as default };
