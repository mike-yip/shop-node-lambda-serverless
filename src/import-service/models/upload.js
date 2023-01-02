"use strict";

import AWS from "aws-sdk";
import csv from "csv-parser";

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

const getUploadedPrefix = () => process.env["FILE_UPLOADED_PREFIX"];

const getUploadedKey = (fileName) =>
  `${getUploadedPrefix()}${fileName}`;

const getParsedKey = (fileName) =>
  `${process.env["FILE_PARSED_PREFIX"]}${fileName}`;

export const getSignedUrlForUpload = async (fileName) => {
  if (!fileName) throw new Error("Name is required");

  const s3 = getS3Instance();
  const params = {
    Bucket: getUploadBucketName(),
    Key: getUploadedKey(fileName),
  };
  return await s3.getSignedUrlPromise("putObject", params);
};

export const parseUploadedFile = async (key) => {
  if (!key) throw new Error("Key is required");

  const s3 = getS3Instance();
  const params = {
    Bucket: getUploadBucketName(),
    Key: key,
  };

  const results = [];

  return new Promise((resolve, reject) => {
    try {
      s3.getObject(params)
        .createReadStream()
        .on("error", (e) => {
          // handle aws s3 error from createReadStream
          reject(e);
        })
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
          console.log(data);
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (e) => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
};

export const copyFileToParsed = async (key) => {
  if (!key) throw new Error("Key is required");

  const s3 = getS3Instance();
  const idx = key.lastIndexOf("/") + 1; // take the file name part
  const fileName = key.substring(idx, key.length);

  const params = {
    Bucket: getUploadBucketName(),
    CopySource: `/${getUploadBucketName()}/${key}`,
    Key: getParsedKey(fileName),
  };

  return await s3.copyObject(params).promise();
};

export const deleteFile = async (key) => {
  if (!key) throw new Error("Key is required");

  const s3 = getS3Instance();

  const params = {
    Bucket: getUploadBucketName(),
    Key: key,
  };

  return await s3.deleteObject(params).promise();
};
