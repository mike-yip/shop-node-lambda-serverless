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
