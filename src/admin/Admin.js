/* eslint-disable import/no-unresolved */
import React, { Suspense, lazy, useEffect, useState } from 'react';
import API from '../props';
import KronologicSankey from './KronologicSankey';
import LevelModal from './LevelModal';
import style from './admin.module';
import useWindowResize from '../hooks/useWindowResize';

const Admin = () => {
  const { width, height } = useWindowResize();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [content, setContent] = useState(null);

  const fetchNodes = async () => {
    const res = await fetch(API.admin.nodes).then(r => r.json());

    setNodes(res.data);
  };

  const fetchLinks = async () => {
    const res = await fetch(API.admin.links).then(r => r.json());

    setLinks([
      ...res.data.map(lead => {
        return {
          ...lead,
          highlight: false,
        };
      }),
    ]);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (modalContent = null) => {
    if (modalContent) {
      setContent(modalContent);

      document
        .getElementById('kronologic-ai-app')
        .classList.add('kronologic--blurred');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setContent(null);

    document
      .getElementById('kronologic-ai-app')
      .classList.remove('kronologic--blurred');

    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchNodes();
    fetchLinks();
  }, []);

  return (
    <section className={style.admin}>
      <LevelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={content}
      />
      <div
        style={{ height: `${height}px`, width: `${width / 1.1}px` }}
      >
        <div className={style.svgContainer}>
          <KronologicSankey
            width={width / 1.1}
            height={height}
            data={{
              leads: links,
              sources: nodes,
            }}
            onModalRequest={openModal}
          />
        </div>
      </div>
    </section>
  );
};

export { Admin as default };
