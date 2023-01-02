"use strict";

import {
  getSignedUrlForUpload,
  parseUploadedFile,
  copyFileToParsed,
  deleteFile,
} from "../../../src/import-service/models/upload";
import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import EventEmitter from "events";
import csv from "csv-parser";

jest.mock("csv-parser", () => {
  return jest.fn(() => "csv-parser-xyz");
});

describe("import-service/models/import.js, getSignedUrlForUpload", () => {
  test("getSignedUrlForUpload with name passed in", async () => {
    const fileName = "abc";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("S3", "getSignedUrl", (ops, params, callback) => {
      let ret = null;

      if (
        ops === "putObject" &&
        params.Bucket === process.env["FILE_UPLOAD_BUCKET_NAME"] &&
        params.Key === `${process.env["FILE_UPLOADED_PREFIX"]}${fileName}`
      )
        ret = "xyz";

      callback(null, ret);
    });

    const url = await getSignedUrlForUpload(fileName);
    expect(url).toEqual("xyz");

    AWSMock.restore("S3", "getSignedUrl");
  });

  test("getSignedUrlForUpload with invalid name passed in", async () => {
    const invalidNameError = new Error("Name is required");

    await expect(getSignedUrlForUpload()).rejects.toThrow(invalidNameError);
    await expect(getSignedUrlForUpload(null)).rejects.toThrow(invalidNameError);
    await expect(getSignedUrlForUpload("")).rejects.toThrow(invalidNameError);
  });

  test("copyFileToParsed with key passed in", async () => {
    const fileName = "abc";
    const sourceKey = `${process.env["FILE_UPLOADED_PREFIX"]}/${fileName}`;
    const bucketName = process.env["FILE_UPLOAD_BUCKET_NAME"];

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("S3", "copyObject", (params, callback) => {
      let ret = null;

      if (
        params.Bucket === bucketName &&
        params.CopySource === `/${bucketName}/${sourceKey}` &&
        params.Key === `${process.env["FILE_PARSED_PREFIX"]}${fileName}`
      )
        ret = "xyz";

      callback(null, ret);
    });

    const response = await copyFileToParsed(sourceKey);
    expect(response).toEqual("xyz");

    AWSMock.restore("S3", "copyObject");
  });

  test("copyFileToParsed with key at root passed in", async () => {
    const fileName = "abc";
    const sourceKey = `${fileName}`;
    const bucketName = process.env["FILE_UPLOAD_BUCKET_NAME"];

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("S3", "copyObject", (params, callback) => {
      let ret = null;

      if (
        params.Bucket === bucketName &&
        params.CopySource === `/${bucketName}/${sourceKey}` &&
        params.Key === `${process.env["FILE_PARSED_PREFIX"]}${fileName}`
      )
        ret = "xyz";

      callback(null, ret);
    });

    const response = await copyFileToParsed(sourceKey);
    expect(response).toEqual("xyz");

    AWSMock.restore("S3", "copyObject");
  });

  test("copyFileToParsed with invalid name passed in", async () => {
    const invalidKeyError = new Error("Key is required");

    await expect(copyFileToParsed()).rejects.toThrow(invalidKeyError);
    await expect(copyFileToParsed(null)).rejects.toThrow(invalidKeyError);
    await expect(copyFileToParsed("")).rejects.toThrow(invalidKeyError);
  });

  test("deleteFile with key passed in", async () => {
    const key = `${process.env["FILE_UPLOADED_PREFIX"]}/abc`;
    const bucketName = process.env["FILE_UPLOAD_BUCKET_NAME"];

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("S3", "deleteObject", (params, callback) => {
      let ret = null;

      if (
        params.Bucket === bucketName &&
        params.Key === key
      )
        ret = "xyz";

      callback(null, ret);
    });

    const response = await deleteFile(key);
    expect(response).toEqual("xyz");

    AWSMock.restore("S3", "deleteObject");
  });

  test("deleteFile with invalid name passed in", async () => {
    const invalidKeyError = new Error("Key is required");

    await expect(deleteFile()).rejects.toThrow(invalidKeyError);
    await expect(deleteFile(null)).rejects.toThrow(invalidKeyError);
    await expect(deleteFile("")).rejects.toThrow(invalidKeyError);
  });
});

// describe("import-service/models/import.js, parseUploadedFile", () => {
//   const keyName = "abc";
//   const getObjectError = new Error("GetObjectFailed");
//   let eventEmitter = null;
//   const params = {
//     Bucket: process.env["FILE_UPLOAD_BUCKET_NAME"],
//     Key: keyName,
//   };

//   beforeEach(() => {
//     eventEmitter = new EventEmitter();

//     AWSMock.setSDKInstance(AWS);
//     AWSMock.mock("S3", "getObject", (params, callback) => {
//       console.log('here', params);
//       if (params.Bucket === process.env["FILE_UPLOAD_BUCKET_NAME"]) {
//         let response = {
//           createReadStream: () => {
//             console.log('called createReadStream here');
//             // return {
//             //   pipe: () => {
//             //     return {
//             //       on: () => eventEmitter
//             //     };
//             //   },
//             //   //() => eventEmitter,//jest.fn(() => eventEmitter),
//             //   on: (eventName, cb) => {
//             //     eventEmitter.on(eventName, cb);
//             //     return eventEmitter;
//             //   },
//             // };
//           },
//         };

//         callback(null, response);
//       } else {
//         callback(getObjectError);
//       }
//     });
//   });

//   afterEach(() => {
//     eventEmitter = null;
//     AWSMock.restore("S3", "getObject");
//   });

//   test("parseUploadedFile, createReadStream error", async () => {
//     await parseUploadedFile(keyName);

//     console.log(eventEmitter.listeners("error"));

//     expect(true).toEqual(true);
//   });
// });
