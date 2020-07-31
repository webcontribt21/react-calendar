/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React from 'react';
import style from './admin.module';

const RawNode = ({ className, content, x, y, onHover, type }) => {
  const nodeHeight =
    type === 'user'
      ? Math.max(y[1] - y[0], 100)
      : Math.max(y[1] - y[0], 75);

  return (
    <foreignObject
      x={x[0]}
      y={y[0]}
      width={x[1] - x[0]}
      height={nodeHeight}
      onMouseEnter={onHover}
    >
      <section>
        <div className={className} style={{ height: nodeHeight }}>
          <div className={style.nodeContent}>{content}</div>
        </div>
      </section>
    </foreignObject>
  );
};

RawNode.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.string,
  ]).isRequired,
  onHover: PropTypes.func,
  type: PropTypes.string,
  x: PropTypes.arrayOf(PropTypes.number).isRequired,
  y: PropTypes.arrayOf(PropTypes.number).isRequired,
};

RawNode.defaultProps = {
  className: null,
  onHover: () => {},
  type: null,
};

/**
 * @function
 * DefaultNode
 *
 * @description
 * Renders default node.
 *
 * @returns {SVGForeignObjectElement}
 */
const DefaultNode = ({
  content,
  x0,
  x1,
  y0,
  y1,
  className,
  onHover,
  type,
}) => (
  <RawNode
    className={className}
    content={content}
    x={[x0, x1]}
    y={[y0, y1]}
    onHover={onHover}
    type={type}
  />
);

DefaultNode.propTypes = {
  className: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.string,
  ]).isRequired,
  onHover: PropTypes.func,
  type: PropTypes.string,
  x0: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired,
  y0: PropTypes.number.isRequired,
  y1: PropTypes.number.isRequired,
};

DefaultNode.defaultProps = {
  className: null,
  onHover: () => {},
  type: null,
};

export { DefaultNode as default };
