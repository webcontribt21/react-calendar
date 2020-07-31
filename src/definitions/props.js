import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

const MEETING_MGMT = {
  types: {
    distribution: {
      RANDOM: 'random',
      RANDOM_HIGH_VOLUME: 'random_high_volume',
      SEQUENTIAL: 'sequential',
    },
    routing: {
      CUSTOM: 'custom',
      RANDOM: 'random',
      SEQUENTIAL: 'sequential',
    },
  },
};

const SYSTEM_FIELDS = {
  CONTACT_ACCOUNT: 'contact_account',
  CONTACT_FIRST_NAME: 'contact_first_name',
  CONTACT_LAST_NAME: 'contact_last_name',
  CONTACT_LEAD_SCORE: 'contact_lead_score',
  CONTACT_LOGIC_FIELD: 'contact_logic_field',
  CONTACT_PHONE: 'contact_phone',
  GREETING: 'greeting',
  MEETING_DATE_TIME: 'meeting_date_time',
  MEETING_DAY_OF_WEEK: 'meeting_day_of_week',
  MEETING_DURATION: 'meeting_duration',
  MEETING_LINK: 'meeting_link',
  MEETING_MONTH_DAY: 'meeting_month_day',
  MEETING_TIME: 'meeting_time',
  TIME_CASUAL_DAY: 'time_casual_day',
  TIME_NUMBER_DATE: 'time_number_date',

  USER_COMPANY: 'user_company',
  USER_FIRST_NAME: 'user_first_name',
  USER_LAST_NAME: 'user_last_name',
  USER_LOCATION: 'user_location',
  USER_PHONE: 'user_phone',
  USER_TITLE: 'user_title',
};

const SYSTEM_FIELDS_SAMPLES = {
  [SYSTEM_FIELDS.CONTACT_ACCOUNT]: 'Space X',
  [SYSTEM_FIELDS.CONTACT_FIRST_NAME]: 'Elon',
  [SYSTEM_FIELDS.CONTACT_LAST_NAME]: 'Musk',
  [SYSTEM_FIELDS.CONTACT_LEAD_SCORE]: 'Variable Field 1',
  [SYSTEM_FIELDS.CONTACT_LOGIC_FIELD]: 'Variable Field 2',
  [SYSTEM_FIELDS.CONTACT_PHONE]: '254 840-5771',
  [SYSTEM_FIELDS.GREETING]: 'Good evening',
  [SYSTEM_FIELDS.MEETING_DATE_TIME]: 'Tuesday 11/5 @ 2:30 pm CST',
  [SYSTEM_FIELDS.MEETING_DAY_OF_WEEK]: 'Tuesday',
  [SYSTEM_FIELDS.MEETING_LINK]: '--',
  [SYSTEM_FIELDS.MEETING_MONTH_DAY]: dayjs().format('MMMM Do'),
  [SYSTEM_FIELDS.MEETING_TIME]: '2:30 pm CST',
  [SYSTEM_FIELDS.TIME_CASUAL_DAY]: 'Tuesday',
  [SYSTEM_FIELDS.TIME_NUMBER_DATE]: dayjs().format('Do'),

  [SYSTEM_FIELDS.MEETING_DURATION]: '30 minutes',
  [SYSTEM_FIELDS.USER_COMPANY]: 'Kronologic',
  [SYSTEM_FIELDS.USER_TITLE]: '--',
  [SYSTEM_FIELDS.USER_FIRST_NAME]: '--',
  [SYSTEM_FIELDS.USER_LAST_NAME]: '--',
  [SYSTEM_FIELDS.USER_PHONE]: '--',
  [SYSTEM_FIELDS.USER_LOCATION]: 'Austin, TX',
};

export { MEETING_MGMT, SYSTEM_FIELDS, SYSTEM_FIELDS_SAMPLES };
