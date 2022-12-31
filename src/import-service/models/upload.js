"use strict";

import AWS from "aws-sdk";

const getUploadBucketName = () => process.env["FILE_UPLOAD_BUCKET_NAME"];

const getUploadBucketSignatureVersion = () =>
  process.env["FILE_UPLOAD_BUCKET_SIGNATURE_VERSION"];

const getS3Instance = (() => {
  let s3 = null;
  return () => {
    if (!s3)
      s3 = new AWS.S3({ signatureVersion: getUploadBucketSignatureVersion() });
    return s3;
  };
})();

const getUploadKey = (fileName) => `uploaded/${fileName}`;

export const getSignedUrlForUpload = async (fileName) => {
  if (!fileName) throw new Error("Name is required");

  const s3 = getS3Instance();
  const params = {
    Bucket: getUploadBucketName(),
    Key: getUploadKey(fileName),
  };
  return await s3.getSignedUrlPromise("putObject", params);
};
