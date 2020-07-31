/* eslint-disable import/no-unresolved */
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiMinus,
  mdiPlus,
} from '@mdi/js';
import { sankey, sankeyLeft } from 'd3-sankey';
import Icon from '@mdi/react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import hubspotImg from 'assets/hubspot.png';
import salesforceImg from 'assets/salesforce';
import zapierImg from 'assets/zapier.png';
import style from './admin.module.scss';
import NodeLink from './NodeLink';
import DefaultNode from './Node';
import { dir, levels } from './props';

const colsMappings = {
  [levels.SOURCE]: 'integration',
  [levels.CHANNELS]: 'channel',
  [levels.MICROJOBS]: 'meeting',
  [levels.USERS]: 'user',
};

const colOrder = {
  [levels.SOURCE]: 0,
  [levels.CHANNELS]: 1,
  [levels.MICROJOBS]: 2,
  [levels.USERS]: 3,
};

const nodeTypeStyle = {
  default: cx(style.node, style.defaultNode),
  integration: cx(style.node, style.integrationNode),
  user: cx(style.node, style.userNode),
};

const integrationImages = {
  hubspot: hubspotImg,
  salesforce: salesforceImg,
  zapier: zapierImg,
};

/**
 * @function
 * KronologicSankey
 * @description
 * Renders Sankey chart
 *
 * @param {number} width windos width in pixels.
 * @param {number} height windos height in pixels.
 *
 * @returns {ReactElement} SVG dom element.
 */
const KronologicSankey = ({
  width,
  height,
  data,
  onModalRequest,
}) => {
  const [sortBy, setSortBy] = useState([levels.USERS, dir.ASC]);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [sources, setSources] = useState([]);
  const [leads, setLeads] = useState([]);
  const graph = useRef(null);

  /**
   * @function
   * sort
   * @description
   * sorting algorithm
   * @private
   *
   * @param {object} nodeA first node to compare against for sorting.
   * @param {object} nodeB last node to process for sorting.
   *
   * @returns {number}
   *  returns a value less than 0 if the first node
   *  should be above the second, and a value greater than 0 if the second
   *  node should be above the first, or 0 if the order is not specified.
   */
  const sort = useCallback(
    (nodeA, nodeB) => {
      const [column, direction] = sortBy;
      let sortResult = 0;

      if (direction === 0) {
        return sortResult;
      }

      if (nodeA.type === colsMappings[column]) {
        if (nodeA.name.toLowerCase() > nodeB.name.toLowerCase()) {
          sortResult = 1;
        }

        if (nodeA.name.toLowerCase() < nodeB.name.toLowerCase()) {
          sortResult = -1;
        }

        return sortResult * -direction;
      }

      return sortResult;
    },
    [sortBy],
  );

  /**
   * @class
   * getMaxDepthOfNodes
   * @description
   * gets the depth of the chart.
   * @private
   *
   * @returns {number} returns the max depth for all node levels.
   */
  const getMaxDepthOfNodes = () => {
    if (!nodes || !nodes.length) {
      return 0;
    }

    return nodes
      .map(node => node.depth)
      .reduce((max, cur) => Math.max(max, cur), -Infinity);
  };

  /**
   * @private
   * @function
   * getNodeMinXPosByDepth
   *
   * @description
   * function to retrieve current's node min X
   * position within a graph depth.
   *
   * @returns {number}
   */
  const getNodeMinXPosByDepth = (depth = 0) => {
    if (nodes && nodes.length && depth <= getMaxDepthOfNodes()) {
      return nodes
        .filter(node => node.depth === depth)
        .map(node => node.x0)
        .reduce((min, cur) => Math.min(min, cur), Infinity);
    }

    return 0;
  };

  /**
   * @class
   * getNodesCountByType
   * @description
   * Gets total amount of nodes by type.
   * @private
   *
   * @param {string} type node type.
   *
   * @returns {number} total amount of nodes filtered by type.
   */
  const getNodesCountByTpe = useCallback(
    type => {
      return sources.filter(node => node.type === type).length;
    },
    [sources],
  );

  const getDirection = direction => {
    if (direction === dir.ASC) {
      return dir.DESC;
    }

    if (direction === dir.DESC) {
      return 0;
    }

    return dir.ASC;
  };

  const onColHeaderClick = (col, direction) => {
    setSortBy([col, getDirection(direction)]);
  };

  const Header = ({ sortCol, sortDir, onSort }) => {
    const [show, setShow] = useState({ key: -1, show: false });
    const onMouseEnter = key => setShow({ key, show: true });
    const onMouseOut = key => setShow({ key, show: false });

    return (
      <>
        {Object.values(levels)
          .sort((a, b) => {
            return colOrder[a] - colOrder[b];
          })
          .map((key, i) => {
            const compoundKey = `title-${key}`;

            return (
              <foreignObject
                key={compoundKey}
                x={getNodeMinXPosByDepth(i) + 50}
                y={25}
                width="100%"
                height="100%"
                className={style.col}
              >
                <div
                  onMouseEnter={() => onMouseEnter(key)}
                  onBlur={() => onMouseOut(key)}
                >
                  <button
                    type="button"
                    className={style.colTitle}
                    onClick={() => onSort(key, sortDir)}
                  >
                    <span>{key}</span>
                    {key === sortCol && sortDir === dir.ASC && (
                      <Icon path={mdiChevronUp} size={1.4} />
                    )}
                    {key === sortCol && sortDir === dir.DESC && (
                      <Icon path={mdiChevronDown} size={1.4} />
                    )}
                    {(key !== sortCol || sortDir === 0) && (
                      <Icon path={mdiMinus} size={1.4} />
                    )}
                  </button>
                  {show.key === key && show.show && (
                    <Icon
                      path={mdiPlus}
                      size={2}
                      onClick={() => onModalRequest(key)}
                    />
                  )}
                </div>
              </foreignObject>
            );
          })}
        <line
          x1={getNodeMinXPosByDepth(0)}
          y1={100}
          x2={getNodeMinXPosByDepth(getMaxDepthOfNodes()) + 200}
          y2={100}
          className={style.hr}
        />
      </>
    );
  };

  Header.propTypes = {
    onSort: PropTypes.func.isRequired,
    sortCol: PropTypes.string.isRequired,
    sortDir: PropTypes.oneOf([dir.ASC, dir.DESC, 0]).isRequired,
  };

  if (!graph.current) {
    graph.current = sankey()
      .nodeId(n => n.id)
      .nodeWidth(200)
      .nodePadding(25)
      .nodeSort(sort)
      .nodeAlign(sankeyLeft);
  }

  useEffect(() => {
    if (data?.leads?.length && data?.sources?.length) {
      setLeads(data.leads);
      setSources(data.sources);
    }
  }, [data]);

  useEffect(() => {
    if (graph.current && sources?.length && leads?.length) {
      const {
        nodes: sankeyNodes,
        links: sankeyLinks,
      } = graph.current
        .extent([
          [0, 250],
          [width, height + getNodesCountByTpe('user') * 100],
        ])
        .nodeSort(sort)({
        links: leads,
        nodes: sources,
      });

      setNodes(sankeyNodes);
      setLinks(sankeyLinks);
    }
  }, [
    sources,
    leads,
    sortBy,
    width,
    height,
    getNodesCountByTpe,
    sort,
  ]);

  /**
   * @function
   * IntegrationNode
   *
   * @description
   * Renders source node with it's proper image for integration.
   *
   * @returns {SVGForeignObjectElement}
   */
  const IntegrationNode = ({
    type,
    x0,
    x1,
    y0,
    y1,
    // value,
    sourceLinks,
    // targetLinks,
  }) => {
    const onHover = () => {
      const indeces = new Set();

      const getIndeces = link => {
        const {
          target: { sourceLinks: slinks },
          index,
        } = link;

        if (slinks.length) {
          slinks.forEach(l => {
            getIndeces(l);
          });
        }

        if (index >= 0) {
          indeces.add(index);
        }
      };

      getIndeces({ target: { sourceLinks } });

      setLeads(
        leads.map(lead => {
          return {
            ...lead,
            highlight: indeces.has(lead.index),
          };
        }),
      );
    };

    const Image = ({ name }) => {
      return (
        <img
          src={integrationImages[name]}
          alt={name}
          className={style.integrationImg}
        />
      );
    };

    Image.propTypes = {
      name: PropTypes.string,
    };

    Image.defaultProps = {
      name: null,
    };

    return (
      <DefaultNode
        content={<Image name={type} />}
        className={nodeTypeStyle.integration}
        x0={x0}
        x1={x1}
        y0={y0}
        y1={y1}
        onHover={onHover}
      />
    );
  };

  IntegrationNode.propTypes = {
    sourceLinks: PropTypes.arrayOf(Object).isRequired,
    type: PropTypes.string.isRequired,
    x0: PropTypes.number.isRequired,
    x1: PropTypes.number.isRequired,
    y0: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
  };

  if (!nodes || !links) {
    return null;
  }

  return (
    <svg
      id="graph"
      className={style.svg}
      style={{
        height: `${height + getNodesCountByTpe('user') * 100}px`,
        width: `${width}px`,
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMinYMin meet"
    >
      <g style={{ mixBlendMode: 'multiply' }}>
        <Header
          sortCol={sortBy[0]}
          sortDir={sortBy[1]}
          onSort={onColHeaderClick}
        />
        {nodes.map((node, i) => {
          const { id, depth, type, name, ...rest } = node;

          if (type === 'integration') {
            return (
              <IntegrationNode
                key={`integration-node-${id}`}
                type={name}
                {...rest}
              />
            );
          }

          return (
            <DefaultNode
              className={
                Object.keys(nodeTypeStyle).includes(type)
                  ? nodeTypeStyle[type]
                  : nodeTypeStyle.default
              }
              content={name}
              key={`default-node-${id}`}
              type={type}
              {...rest}
            />
          );
        })}

        {links.map(link => (
          <NodeLink key={`link-${link.index}`} link={link} />
        ))}
      </g>
    </svg>
  );
};

KronologicSankey.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  height: PropTypes.number.isRequired,
  onModalRequest: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
};

export { KronologicSankey as default };
