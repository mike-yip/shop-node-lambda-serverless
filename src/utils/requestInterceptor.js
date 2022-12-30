"use strict";

export const logRequest = async (event, context) => {
  console.log(JSON.stringify({ event, context }, null, 2));
  return context.prev;
};
