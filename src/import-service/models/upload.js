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

const getUploadedKey = (fileName) => `${getUploadedPrefix()}${fileName}`;

const getParsedKey = (fileName) =>
  `${process.env["FILE_PARSED_PREFIX"]}${fileName}`;

const getSqsInstance = (() => {
  let sqs = null;
  return () => {
    if (!sqs) sqs = new AWS.SQS();
    return sqs;
  };
})();

const getCreateProductSqsUrl = () => process.env["CATALOG_ITEMS_QUEUE_URL"];

const sendCreateProductSqsMessage = async (product) => {
  const sqs = getSqsInstance();
  const queueUrl = getCreateProductSqsUrl();
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(product),
  };

  await sqs.sendMessage(params).promise();
};

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
          sendCreateProductSqsMessage(data).catch((e) => {
            // TODO: error handling?
            console.error(e);
          });
        })
        .on("end", () => {
          resolve();
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
