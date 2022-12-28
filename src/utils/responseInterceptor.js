"use strict";

export const appendCorsHeaders = async (event, context) => {
  return {
    ...context.prev,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

export const errorHandler = async (event, context) => {
  const error = context.prev;

  return {
    statusCode: 500,
    body: JSON.stringify({
      message: error.message,
    }),
  };
};
