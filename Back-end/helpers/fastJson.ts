import fastJson from 'fast-json-stringify';

export const stringifySessionInfo = fastJson({
  title: 'session-info',
  type: 'object',
  properties: {
    type: {
      type: 'string',
    },
    sessionId: {
      type: 'string',
    },
    ownId: {
      type: 'string',
    },
    latestTime: {
      type: 'number',
    },
    latestMessage: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    avatar: {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'null',
        },
      ],
    },
  },
  required: ['type', 'sessionId', 'latestTime', 'latestMessage', 'name', 'avatar'],
});
