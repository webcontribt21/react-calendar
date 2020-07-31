import {
  mdiSourceFork,
  mdiCalendarBlankMultiple,
  mdiAccountGroupOutline,
  mdiCalendarEdit,
  mdiArrowDecisionOutline,
  mdiAccountCircleOutline,
  mdiCalendarBlank,
  mdiCalendarMultiselect,
} from '@mdi/js';

const ROLES = {
  ADMIN: 1,
  DEFAULT: 0,
  ORG: 2,
  SUPER_ADMIN: 3,
};

const NAVIGATION = [
  {
    icon: mdiSourceFork,
    id: 'integrations',
    path: 'integrations',
    role: ROLES.ORG,
    text: 'integrations',
    tooltip: 'integrations',
  },
  {
    icon: mdiAccountCircleOutline,
    id: 'contacts',
    path: 'contacts',
    role: ROLES.ADMIN,
    text: 'contacts',
    tooltip: 'contacts',
  },
  {
    icon: mdiArrowDecisionOutline,
    id: 'channels',
    path: 'channels/import',
    role: ROLES.ADMIN,
    text: 'channels',
    tooltip: 'channels',
  },
  {
    icon: mdiCalendarEdit,
    id: 'meetings',
    path: 'meetings',
    role: ROLES.ADMIN,
    text: 'meetings',
    tooltip: 'meetings',
  },
  {
    icon: mdiAccountGroupOutline,
    id: 'users',
    path: 'users/management',
    role: ROLES.ADMIN,
    text: 'users',
    tooltip: 'user management',
  },
  /* {
    icon: mdiCalendarBlankMultiple,
    id: 'team',
    path: 'team/calendar',
    role: ROLES.DEFAULT,
    text: 'team calendar',
    tooltip: 'team calendar',
  }, */
  {
    icon: mdiCalendarMultiselect,
    id: 'instances',
    path: 'instances',
    role: ROLES.DEFAULT,
    text: 'instances',
    tooltip: 'meeting instances',
  },
  {
    icon: mdiCalendarBlank,
    id: 'calendar',
    path: 'user/calendar',
    role: ROLES.DEFAULT,
    text: 'calendar',
    tooltip: 'calendar',
  },
];

export { NAVIGATION, ROLES };
