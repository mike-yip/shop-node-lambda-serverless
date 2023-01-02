"use strict";

import {
  getSignedUrlForUpload,
  parseUploadedFile,
  copyFileToParsed,
  deleteFile,
} from "../models/upload";

export const importProductsFile = async (event) => {
  const name = event.queryStringParameters.name;
  const signedUrl = await getSignedUrlForUpload(name);

  return {
    statusCode: 200,
    body: JSON.stringify(signedUrl),
  };
};

export const importFileParser = async (event) => {
  try {
    const key = event.Records[0].s3.object.key.replace(/\+/g, " ");
    await parseUploadedFile(key);
    await copyFileToParsed(key);
    await deleteFile(key);
  } catch (e) {
    console.error(e);
  }
};
