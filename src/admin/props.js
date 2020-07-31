const levels = {
  CHANNELS: 'channels',
  MICROJOBS: 'micro jobs',
  SOURCE: 'source',
  USERS: 'users',
};

const types = ['user', 'channel', 'microjob'];

const sources = {
  CSV: 'csv',
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  ZAPIER: 'zapier',
};

const dir = {
  ASC: 1,
  DESC: -1,
};

export { dir, levels, types, sources };
