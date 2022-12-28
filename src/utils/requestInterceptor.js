"use strict";

export const logRequest = async (event, context) => {
  console.log(
    JSON.stringify(
      {
        event: event,
        context: context,
      },
      null,
      2
    )
  );
  return context.prev;
};
