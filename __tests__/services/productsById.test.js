"use strict";

import { getProductById } from "../../src/utils/product";
import { getProductsById } from "../../src/services/productsById";

jest.mock("../../src/utils/product", () => {
  return {
    getProductById: jest.fn((productId) => {
      return new Promise((resolve) => {
        if (productId === "abc") {
          resolve({
            id: "abc",
          });
        } else {
          resolve(null);
        }
      });
    }),
  };
});

describe("services/productsById.js", () => {
  test("getProductsById with valid product id", async () => {
    const response = await getProductsById({
      pathParameters: {
        productId: "abc",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        id: "abc",
      }),
    });
  });

  test("getProductsById with undefined product id", async () => {
    const response = await getProductsById({
      pathParameters: {
        productId: undefined,
      },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        message: "Product not found",
      }),
    });
  });

  test("getProductsById with not exist product id", async () => {
    const response = await getProductsById({
      pathParameters: {
        productId: "xyz",
      },
    });

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        message: "Product not found",
      }),
    });
  });
});
