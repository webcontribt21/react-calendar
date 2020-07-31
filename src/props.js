const API = {
  admin: {
    links: `${process.env.API_SERVICE}/admin/leads`,
    nodes: `${process.env.API_SERVICE}/admin/nodes`,
  },
  appSettings: {
    default: `${process.env.API_SERVICE}/app/settings/`,
  },
  auth: {
    google: `${process.env.API_SERVICE}/user/google/authorization_url`,
    logout: `${process.env.API_SERVICE}/user/logout`,
    o365: `${process.env.API_SERVICE}/user/microsoft/authorization_url`,
  },
  calendar: {
    meetings: `${process.env.API_SERVICE}/calendar/meetings`,
    users: `${process.env.API_SERVICE}/calendar/users`,
  },
  channels: {
    default: id =>
      `${process.env.API_SERVICE}/user/channels/${id ? `${id}` : ''}`,
    import: id =>
      `${process.env.API_SERVICE}/user/channels/import/${
        id ? `${id}` : ''
      }`,
    intercept: id =>
      `${process.env.API_SERVICE}/user/channels/intercept/${
        id ? `${id}` : ''
      }`,
    update: id =>
      `${process.env.API_SERVICE}/user/channels/update/${
        id ? `${id}` : ''
      }`,
  },
  contacts: {
    csv: `${process.env.API_SERVICE}/contact/csv`,
    default: id => `${process.env.API_SERVICE}/contact/${id || ''}`,
    history: id => `${process.env.API_SERVICE}/people/leads/${id}`,
  },
  integrations: {
    default: id =>
      `${process.env.API_SERVICE}/integrations/${id || ''}`,
    salesforce: {
      authURL: `${process.env.API_SERVICE}/salesforce/authorization_url`,
      default: id =>
        `${process.env.API_SERVICE}/salesforce/${id || ''}`,
      disconnect: id =>
        `${process.env.API_SERVICE}/salesforce/disconnect/${id ||
          ''}`,
      eventHandlers: id =>
        `${process.env.API_SERVICE}/salesforce/event_handlers/${id ||
          ''}`,
      exportRules: id =>
        `${process.env.API_SERVICE}/salesforce/export_rules/${id ||
          ''}`,
      instance: id =>
        `${process.env.API_SERVICE}/salesforce/instance/${id || ''}`,
      oFields: (id, otype) =>
        `${process.env.API_SERVICE}/salesforce/object_fields/${id}/${otype}`,
    },
  },
  meetings: {
    default: id =>
      `${process.env.API_SERVICE}/meetings/definition${
        id ? `/${id}` : ''
      }`,
    history: id =>
      `${process.env.API_SERVICE}/meetings/instance/history${
        id ? `/${id}` : ''
      }`,
    instance: `${process.env.API_SERVICE}/meetings/instance`,
    instances: `${process.env.API_SERVICE}/meetings/instances`,
  },
  settings: {
    provisioning: {
      migration: schema =>
        `${process.env.API_SERVICE}/provisioning/migration/${schema}`,
      org: `${process.env.API_SERVICE}/provisioning/org`,
    },
  },
  tags: {
    default: id =>
      `${process.env.API_SERVICE}/tags${id ? `/${id}` : ''}`,
  },
  teams: {
    default: id =>
      `${process.env.API_SERVICE}/teams/${id ? `${id}` : ''}`,
  },
  templates: {
    email: {
      default: id =>
        `${process.env.API_SERVICE}/templates/email${
          id ? `/${id}` : ''
        }`,
    },
    invite: {
      default: id =>
        `${process.env.API_SERVICE}/templates/invite${
          id ? `/${id}` : ''
        }`,
    },
  },
  users: {
    all: `${process.env.API_SERVICE}/users/all`,
    default: id =>
      `${process.env.API_SERVICE}/users/${id ? `${id}` : ''}`,
    meetings: `${process.env.API_SERVICE}/users/meetings`,
  },
};

export default API;
