"use strict";

export const errorHandler = async (event, context) => {
  const error = context.prev;
  context.end();

  return {
    statusCode: 500,
    body: JSON.stringify({
      message: error.message,
    }),
  };
};
