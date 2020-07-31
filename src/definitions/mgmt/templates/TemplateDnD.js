/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import HTML5Backend from 'react-dnd-html5-backend';
import cx from 'classnames';
import Icon from '@mdi/react';
import {
  mdiEmailOutline,
  mdiCalendarMonthOutline,
  mdiSelectDrag,
  mdiDragHorizontal,
} from '@mdi/js';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import shortid from 'shortid';
import Card from '../../../components/card/Card';
import { get } from '../../../utils/fetch';
import API from '../../../props';
import withParameters from '../../../utils/url';
import { AuthContext } from '../../../auth/AuthContextService';
import style from './style.module.scss';

ReactModal.setAppElement('#kronologic-ai-app');

const templateType = {
  EMAIL: 'email',
  INVITE: 'invite',
};

const templateTypeIcon = {
  [templateType.EMAIL]: mdiEmailOutline,
  [templateType.INVITE]: mdiCalendarMonthOutline,
};

const DraggableTemplate = ({ id, type, name, order, uuid }) => {
  const [{ isDragging }, dragRef, preview] = useDrag({
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: { id, name, type, uuid },
  });

  return (
    <>
      <div
        ref={dragRef}
        className={cx(style.draggable, {
          [style.isDragging]: isDragging,
        })}
      >
        <Icon path={templateTypeIcon[type]} size={1} />
        <span>{name}</span>
        {order && <span className={style.orderInfo}>{order}</span>}
      </div>
    </>
  );
};

DraggableTemplate.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  order: PropTypes.number,
  type: PropTypes.string,
  uuid: PropTypes.string,
};

DraggableTemplate.defaultProps = {
  name: '',
  order: null,
  type: '',
  uuid: null,
};

const TemplateContainer = ({
  accept,
  templates,
  canDrop,
  onDrop,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: accept || [templateType.EMAIL, templateType.INVITE],
    canDrop: () => canDrop,
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
    drop: item => {
      onDrop(item.id, item.uuid);
    },
  });

  return (
    <div
      ref={drop}
      className={cx(style.selectedTemplates, {
        [style.isActive]: isOver,
      })}
    >
      {templates.map(t => {
        return (
          <DraggableTemplate
            key={`tmpl-uuid-${t.uuid || shortid.generate()}`}
            id={t.id}
            type={t.type}
            name={t.name}
            order={t.order}
            uuid={t.uuid}
          />
        );
      })}
    </div>
  );
};

TemplateContainer.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  canDrop: PropTypes.bool,
  onDrop: PropTypes.func,
  templates: PropTypes.arrayOf(PropTypes.object).isRequired,
};

TemplateContainer.defaultProps = {
  accept: null,
  canDrop: true,
  onDrop: () => {},
};

const TemplateDnD = ({ onChange, selected }) => {
  const { logout } = useContext(AuthContext);
  const [emailTemplates, setEmailTemplates] = useState(selected);
  const [inviteTemplates, setInviteTemplates] = useState(selected);
  const [allTemplates, setAllTemplates] = useState([]);

  useEffect(() => {
    if (selected) {
      setEmailTemplates(
        selected.filter(t => t.type === templateType.EMAIL),
      );
      setInviteTemplates(
        selected.filter(t => t.type === templateType.INVITE),
      );
    }
  }, [selected]);

  const fetchTemplates = useCallback(async () => {
    const etRes = await get(
      withParameters(
        API.templates.email.default(),
        ['limit', 'offset', 'sortBy'],
        [100, 0, 'name asc'],
      ),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    const itRes = await get(
      withParameters(
        API.templates.invite.default(),
        ['limit', 'offset', 'sortBy'],
        [100, 0, 'name asc'],
      ),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (etRes?.data && itRes?.data) {
      const templates = [
        ...etRes.data.map(t => ({
          ...t,
          type: templateType.EMAIL,
          uuid: shortid.generate(),
        })),
        ...itRes.data.map(t => ({
          ...t,
          type: templateType.INVITE,
          uuid: shortid.generate(),
        })),
      ];

      if (emailTemplates.length && inviteTemplates.length) {
        setAllTemplates([
          templates.filter(
            a => !emailTemplates.find(b => a.id === b.id),
          ),
          templates.filter(
            a => !inviteTemplates.find(b => a.id === b.id),
          ),
        ]);
      } else {
        setAllTemplates(templates);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const selectEmailTemplate = useCallback(
    (templateId, uuid) => {
      const email = allTemplates.find(t => t.uuid === uuid);

      if (email) {
        setEmailTemplates([
          ...emailTemplates.map((t, i) => ({
            ...t,
            order: i + 1,
          })),
          {
            ...email,
            order: emailTemplates.length + 1,
          },
        ]);
      }
    },
    [allTemplates, emailTemplates],
  );

  const selectInviteTemplate = useCallback(
    (templateId, uuid) => {
      const invite = allTemplates.find(t => t.uuid === uuid);

      if (invite) {
        setInviteTemplates([
          ...inviteTemplates.map((t, i) => ({
            ...t,
            order: i + 1,
          })),
          {
            ...invite,
            order: inviteTemplates.length + 1,
          },
        ]);
      }
    },
    [allTemplates, inviteTemplates],
  );

  const unselectTemplate = useCallback(
    (templateId, uuid) => {
      const findFunc = t => t.uuid === uuid;
      const email = emailTemplates.find(findFunc);
      const invite = inviteTemplates.find(findFunc);

      if (email) {
        const newSelectedTemplates = emailTemplates.filter(
          t => t.uuid !== uuid,
        );
        setEmailTemplates([
          ...newSelectedTemplates.map((t, i) => ({
            ...t,
            order: i + 1,
          })),
        ]);
      }

      if (invite) {
        const newSelectedTemplates = inviteTemplates.filter(
          t => t.uuid !== uuid,
        );
        setInviteTemplates([
          ...newSelectedTemplates.map((t, i) => ({
            ...t,
            order: i + 1,
          })),
        ]);
      }
    },
    [emailTemplates, inviteTemplates],
  );

  useEffect(() => {
    const meetingTemplates = emailTemplates.map(t => {
      const inviteTypeTemplate = inviteTemplates.find(
        it => it.order === t.order,
      );

      return {
        etid: t.id,
        itid: inviteTypeTemplate?.id,
        order: t.order,
      };
    });

    onChange({
      emailTemplatesCount: emailTemplates.length,
      inviteTemplatesCount: inviteTemplates.length,
      meetingTemplates,
    });
  }, [emailTemplates, inviteTemplates, onChange]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="row">
        <div className="col-6">
          <Card icon={mdiSelectDrag} header="Drag Templates">
            <TemplateContainer
              templates={allTemplates}
              onDrop={unselectTemplate}
            />
          </Card>
        </div>
        <div className="col-6">
          <Card icon={mdiDragHorizontal} header="Drop &amp; Order">
            <div className={style.containerGroup}>
              <span>Email Templates</span>
              <TemplateContainer
                accept={[templateType.EMAIL]}
                templates={emailTemplates}
                onDrop={selectEmailTemplate}
              />
            </div>
            <div className={style.containerGroup}>
              <span>Invite Templates</span>
              <TemplateContainer
                accept={[templateType.INVITE]}
                templates={inviteTemplates}
                onDrop={selectInviteTemplate}
              />
            </div>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
};

TemplateDnD.propTypes = {
  onChange: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.object),
};

TemplateDnD.defaultProps = {
  onChange: () => {},
  selected: [],
};

export { TemplateDnD as default };
