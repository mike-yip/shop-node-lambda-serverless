"use strict";

import { errorHandler } from "../../src/middlewares/responseInterceptor";

describe("utils/responseInterceptor.js", () => {
  test("errorHandler", async () => {
    const errorMessage = "some error";
    const context = {
      prev: new Error(errorMessage),
      end: jest.fn(),
    };

    const response = await errorHandler(null, context);

    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: errorMessage,
      }),
    });
    expect(context.end).toHaveBeenCalled();
  });
});
