"use strict";

const isValidUser = async (username, password) => {
  return (
    process.env.hasOwnProperty(username) &&
    password &&
    process.env[username] === password
  );
};

const generatePolicy = function (principalId, effect, resource) {
  var authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};

export const basicAuthorizer = async (event) => {
  const authHeader = event.headers["authorization"] || ""; // Authorization: Basic {authorization_token}
  const [t, authToken] = authHeader.split(" ");

  if (t === "Basic" && authToken) {
    const [username, password] = Buffer.from(authToken, "base64")
      .toString("utf8")
      .split(":");
    const allowLogin = await isValidUser(username, password);

    return generatePolicy(
      username,
      allowLogin ? "Allow" : "Deny",
      event.routeArn
    );
  } else {
    // Authorization header is not provided
    throw new Error("Unauthorized");
  }
};
