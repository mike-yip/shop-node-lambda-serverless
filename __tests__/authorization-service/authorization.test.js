"use strict";

import { basicAuthorizer } from "../../src/authorization-service/authorization";

describe("authorization-service/authorization.js", () => {
  test("basicAuthorizer with valid user", async () => {
    const username = "mikeyip";
    const authorization =
      "Basic " +
      Buffer.from(`${username}:${process.env[username]}`).toString("base64");
    const routeArn = "xyz";

    const event = {
      headers: {
        authorization,
      },
      routeArn,
    };

    const response = await basicAuthorizer(event);
    expect(response).toEqual({
      principalId: username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: routeArn,
          },
        ],
      },
    });
  });

  test("basicAuthorizer with invalid user", async () => {
    const username = "mikeyipxyz";
    const authorization =
      "Basic " + Buffer.from(`${username}:xyz`).toString("base64");
    const routeArn = "xyz";

    const event = {
      headers: {
        authorization,
      },
      routeArn,
    };

    const response = await basicAuthorizer(event);
    expect(response).toEqual({
      principalId: username,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: routeArn,
          },
        ],
      },
    });
  });

  test("basicAuthorizer with no authorization header", async () => {
    const routeArn = "xyz";

    const event = {
      headers: {},
      routeArn,
    };

    await expect(basicAuthorizer(event)).rejects.toThrow(
      new Error("Unauthorized")
    );
  });

  test("basicAuthorizer with valid user but no resource", async () => {
    const username = "mikeyip";
    const authorization =
      "Basic " +
      Buffer.from(`${username}:${process.env[username]}`).toString("base64");
    const routeArn = "";

    const event = {
      headers: {
        authorization,
      },
      routeArn,
    };

    const response = await basicAuthorizer(event);
    expect(response).toEqual({
      principalId: username,
    });
  });
});
