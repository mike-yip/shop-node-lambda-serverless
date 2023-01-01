"use strict";

import {
  getSignedUrlForUpload,
  parseUploadedFile,
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
