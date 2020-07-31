/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { mdiPlus, mdiApi, mdiMinus } from '@mdi/js';
import API from '../props';
import style from './style.module.scss';
import { get, del } from '../utils/fetch';
import { AuthContext } from '../auth/AuthContextService';
import withParameters from '../utils/url';
import Card from '../components/card/Card';
import Button from '../components/button/Button';
import { useToasts } from '../hooks/notifications/notifications';

import hubspotImg from '../assets/hubspot.png';
import salesforceImg from '../assets/salesforce.svg';
import zapierImg from '../assets/zapier.png';

const integrationTypes = {
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  ZAPIER: 'zapier',
};

const integrationImgSrc = {
  [integrationTypes.HUBSPOT]: hubspotImg,
  [integrationTypes.SALESFORCE]: salesforceImg,
  [integrationTypes.ZAPIER]: zapierImg,
};

const Integration = ({
  type,
  children,
  enabled,
  connected,
  onConnect,
  onSandboxConnect,
  onDisconnect,
}) => {
  return (
    <Card
      type="dark"
      className={[style.integration, !enabled ? style.disabled : '']}
    >
      <section className={style.content}>
        <header>
          <img
            src={integrationImgSrc[type]}
            alt={type}
            className={style[type]}
          />
        </header>
        <div className={style.body}>
          <h3>{type}</h3>
          <p>{children}</p>
        </div>
        <footer>
          {enabled && !connected && (
            <>
              <Button icon={mdiPlus} onClick={onConnect}>
                <span>Connect</span>
              </Button>
              <Button type="secondary" onClick={onSandboxConnect}>
                <span>Sandbox</span>
              </Button>
            </>
          )}
          {enabled && connected && (
            <Button icon={mdiMinus} onClick={onDisconnect}>
              <span>Disconnect</span>
            </Button>
          )}
          {!enabled && (
            <Button type="secondary" disabled>
              <span>Cooming soon</span>
            </Button>
          )}
        </footer>
      </section>
    </Card>
  );
};

Integration.propTypes = {
  children: PropTypes.element,
  connected: PropTypes.bool,
  enabled: PropTypes.bool,
  onConnect: PropTypes.func,
  onDisconnect: PropTypes.func,
  onSandboxConnect: PropTypes.func,
  type: PropTypes.string,
};

Integration.defaultProps = {
  children: null,
  connected: false,
  enabled: true,
  onConnect: () => {},
  onDisconnect: () => {},
  onSandboxConnect: () => {},
  type: integrationTypes.SALESFORCE,
};

const Integrations = () => {
  const { logout } = useContext(AuthContext);
  const [salesforce, setSalesforce] = useState(null);
  const { add } = useToasts();

  const handleSalesforceConnect = useCallback(async () => {
    const response = await get(API.integrations.salesforce.authURL)
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      window.location.href = response.url;
    }
  }, [logout]);

  const handleSalesforceTest = useCallback(async () => {
    const response = await get(
      withParameters(
        API.integrations.salesforce.authURL,
        ['is_test'],
        ['true'],
      ),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      window.location.href = response.url;
    }
  }, [logout]);

  const handleSalesforceDisconnect = useCallback(async () => {
    const response = await del(
      API.integrations.salesforce.default(salesforce?.id),
    )
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      setSalesforce(null);
    }
  }, [logout, salesforce]);

  const fetchIntegrations = useCallback(async () => {
    const response = await get(API.integrations.default())
      .then(res => res.json())
      .catch(e => {
        if (e.message === '401') {
          logout();
        }
      });

    if (response) {
      const salesforceFound = response.find(
        integration => integration.name === 'salesforce',
      );

      if (salesforceFound) {
        setSalesforce(salesforceFound);
      }
    }
  }, [logout]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return (
    <div className="container is--fluid">
      <div className="row">
        <div className="col-12">
          <Card
            icon={mdiApi}
            header="integrations"
            className={[style.integrations]}
          >
            <div className="row">
              <div className="col-3 col-offset-2">
                <Integration
                  connected={!!salesforce}
                  type="salesforce"
                  onConnect={handleSalesforceConnect}
                  onSandboxConnect={handleSalesforceTest}
                  onDisconnect={handleSalesforceDisconnect}
                >
                  <span>
                    Customer relationship management solution that
                    brings companies and customers together. It&apos;s
                    one integrated CRM platform that gives all your
                    departments — including marketing, sales,
                    commerce, and service — a single, shared view of
                    every customer.
                  </span>
                </Integration>
              </div>
              <div className="col-3">
                <Integration type="hubspot" enabled={false}>
                  <span>
                    HubSpot is a developer and marketer of software
                    products for inbound marketing and sales.
                  </span>
                </Integration>
              </div>
              <div className="col-3">
                <Integration type="zapier" enabled={false}>
                  <span>
                    Zapier is the glue that connects more than 1,500
                    web apps. Zaps are workflows that connect your
                    apps, so they can work together. Zaps start with a
                    trigger—an event in one of your apps that kicks
                    off your workflow.
                  </span>
                </Integration>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { Integrations as default };
