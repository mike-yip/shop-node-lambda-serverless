"use strict";

import { logRequest } from "../../src/utils/requestInterceptor";

describe("utils/requestInterceptor.js", () => {
  test("logRequest", async () => {
    const event = "abc";
    const context = { prev: "xyz" };
    const consoleLogMock = jest.spyOn(console, "log").mockImplementation();
    const response = await logRequest(event, context);

    expect(response).toEqual(context.prev);
    expect(consoleLogMock).toHaveBeenCalledWith(
      JSON.stringify({ event, context }, null, 2)
    );
    consoleLogMock.mockRestore();
  });
});
