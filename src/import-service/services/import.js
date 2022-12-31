"use strict";

import { getSignedUrlForUpload } from "../models/upload";

export const importProductsFile = async (event) => {
  const name = event?.queryStringParameters?.name;
  const signedUrl = await getSignedUrlForUpload(name);

  return {
    statusCode: 200,
    body: JSON.stringify(signedUrl),
  };
};
