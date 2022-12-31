"use strict";

import {
  getSignedUrlForUpload,
  parseUploadedFile,
} from "../../../src/import-service/models/upload";
import {
  importProductsFile,
  importFileParser,
} from "../../../src/import-service/services/import";

const PARSE_UPLOADED_FILE_ERROR = "Parsing Error";

jest.mock("../../../src/import-service/models/upload", () => {
  return {
    getSignedUrlForUpload: jest.fn((name) => {
      return new Promise((resolve) => {
        resolve(name);
      });
    }),
    parseUploadedFile: jest.fn((key) => {
      return new Promise((resolve, reject) => {
        if (key === "abc" || key === "ijk xyz  mno") {
          resolve();
        } else {
          reject(new Error(PARSE_UPLOADED_FILE_ERROR));
        }
      });
    }),
  };
});

describe("import-service/services/import.js", () => {
  test("importProductsFile with name passed in", async () => {
    const response = await importProductsFile({
      queryStringParameters: {
        name: "abc",
      },
    });

    expect(getSignedUrlForUpload).toHaveBeenCalledWith("abc");
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify("abc"),
    });
  });

  test("importFileParser with object key with no space", async () => {
    await importFileParser({
      Records: [
        {
          s3: {
            object: {
              key: "abc",
            },
          },
        },
      ],
    });

    expect(parseUploadedFile).toHaveBeenCalledWith("abc");
  });

  test("importFileParser with object key with space", async () => {
    await importFileParser({
      Records: [
        {
          s3: {
            object: {
              key: "ijk+xyz++mno",
            },
          },
        },
      ],
    });

    expect(parseUploadedFile).toHaveBeenCalledWith("ijk xyz  mno");
  });

  test("importFileParser with error", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    try {
      await importFileParser({
        Records: [
          {
            s3: {
              object: {
                key: "12345",
              },
            },
          },
        ],
      });
    } catch (e) {
      expect(e.message).toEqual(PARSE_UPLOADED_FILE_ERROR);
    }

    expect(parseUploadedFile).toHaveBeenCalledWith("12345");
    consoleErrorMock.mockRestore();
  });
});
