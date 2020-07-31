import React, { useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

const modules = {
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];

const TextEditorBeta = ({
  value,
  onChange,
  onFocus,
  height,
  showControls,
  ...rest
}) => {
  const ref = useRef(null);

  const handleFocus = useCallback(
    (range, src, editor) => {
      onFocus(range, src, editor, ref);
    },
    [onFocus],
  );

  const handleChange = useCallback(
    (content, delta, source, editor) => {
      onChange(content, delta, source, ref, editor.getText());
    },
    [onChange],
  );

  return (
    <ReactQuill
      ref={ref}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      style={{ height }}
      {...rest}
      modules={
        showControls
          ? modules
          : {
              ...modules,
              toolbar: false,
            }
      }
      formats={formats}
    />
  );
};

TextEditorBeta.propTypes = {
  height: PropTypes.number,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  showControls: PropTypes.bool,
  value: PropTypes.string,
};

TextEditorBeta.defaultProps = {
  height: 100,
  onChange: () => {},
  onFocus: () => {},
  showControls: true,
  value: '',
};

export { TextEditorBeta as default };
