"use strict";

import { getSignedUrlForUpload, parseUploadedFile } from "../models/upload";

export const importProductsFile = async (event) => {
  const name = event?.queryStringParameters?.name;
  const signedUrl = await getSignedUrlForUpload(name);

  return {
    statusCode: 200,
    body: JSON.stringify(signedUrl),
  };
};

export const importFileParser = async (event) => {
  const key = event?.Records?.[0]?.s3?.object?.key?.replace(/\+/g, ' ');
  try {
    await parseUploadedFile(key);
  }
  catch (e) {
    console.error(e);
  }
};
