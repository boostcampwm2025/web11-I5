export const STT_POST_PROCESSING_SCHEMA = {
  type: 'object',
  properties: {
    postProcessed: {
      type: 'string',
      description: '후보정된 STT 변환된 텍스트',
    },
  },

  required: ['postProcessed'],
};
