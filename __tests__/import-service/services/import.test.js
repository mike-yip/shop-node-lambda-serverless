"use strict";

import {
  getSignedUrlForUpload,
  parseUploadedFile,
  copyUploadedFileToParsed,
  deleteFile,
} from "../../../src/import-service/models/upload";
import {
  importProductsFile,
  importFileParser,
} from "../../../src/import-service/services/import";

const mockParseUploadedError = new Error("Parsing Error");
const mockCopyUploadedError = new Error("Copying Error");
const mockDeleteUploadedError = new Error("Deleting Error");

jest.mock("../../../src/import-service/models/upload", () => {
  return {
    getSignedUrlForUpload: jest.fn((name) => {
      return new Promise((resolve) => {
        resolve(name);
      });
    }),
    parseUploadedFile: jest.fn((key) => {
      return new Promise((resolve, reject) => {
        if (
          key === "abc" ||
          key === "ijk xyz  mno" ||
          key === "copy" ||
          key === "delete"
        ) {
          resolve();
        } else {
          reject(mockParseUploadedError);
        }
      });
    }),
    copyUploadedFileToParsed: jest.fn((key) => {
      return new Promise((resolve, reject) => {
        if (key === "abc" || key === "ijk xyz  mno" || key === "delete") {
          resolve();
        } else {
          reject(mockCopyUploadedError);
        }
      });
    }),
    deleteFile: jest.fn((key) => {
      return new Promise((resolve, reject) => {
        if (key === "abc" || key === "ijk xyz  mno") {
          resolve();
        } else {
          reject(mockDeleteUploadedError);
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
    expect(copyUploadedFileToParsed).toHaveBeenCalledWith("abc");
    expect(deleteFile).toHaveBeenCalledWith("abc");
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
    expect(copyUploadedFileToParsed).toHaveBeenCalledWith("ijk xyz  mno");
    expect(deleteFile).toHaveBeenCalledWith("ijk xyz  mno");
  });

  test("importFileParser with error at parseUploadedFile", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

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
    expect(parseUploadedFile).toHaveBeenCalledWith("12345");
    expect(consoleErrorMock).toHaveBeenCalledWith(mockParseUploadedError);
    consoleErrorMock.mockRestore();
  });

  test("importFileParser with error at copyUploadedFileToParsed", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    await importFileParser({
      Records: [
        {
          s3: {
            object: {
              key: "copy",
            },
          },
        },
      ],
    });
    expect(parseUploadedFile).toHaveBeenCalledWith("copy");
    expect(copyUploadedFileToParsed).toHaveBeenCalledWith("copy");
    expect(deleteFile).not.toHaveBeenCalledWith("copy");
    expect(consoleErrorMock).toHaveBeenCalledWith(mockCopyUploadedError);
    consoleErrorMock.mockRestore();
  });

  test("importFileParser with error at deleteFile", async () => {
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    await importFileParser({
      Records: [
        {
          s3: {
            object: {
              key: "delete",
            },
          },
        },
      ],
    });
    expect(parseUploadedFile).toHaveBeenCalledWith("delete");
    expect(copyUploadedFileToParsed).toHaveBeenCalledWith("delete");
    expect(deleteFile).toHaveBeenCalledWith("delete");
    expect(consoleErrorMock).toHaveBeenCalledWith(mockDeleteUploadedError);
    consoleErrorMock.mockRestore();
  });
});
