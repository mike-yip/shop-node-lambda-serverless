"use strict";

import { createProduct } from "../../../src/product-service/models/product";
import { createProductApi } from "../../../src/product-service/services/createProduct";

const mockErrorMessage = "Invalid format";

jest.mock("../../../src/product-service/models/product", () => {
  return {
    createProduct: jest.fn((obj) => {
      if (obj && obj.title && obj.price !== undefined)
        return Promise.resolve({ created: true, product: obj });
      else
        return Promise.resolve({ created: false, message: mockErrorMessage });
    }),
  };
});

describe("services/createProduct.js", () => {
  test("createProductApi with valid product", async () => {
    const product = { title: "title", price: 123 };
    const response = await createProductApi({ body: JSON.stringify(product) });

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(product),
    });
  });

  test("createProductApi with missing title", async () => {
    const product = { price: 123 };
    const response = await createProductApi({ body: JSON.stringify(product) });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: mockErrorMessage,
      }),
    });
  });

  test("createProductApi with missing price", async () => {
    const product = { title: "title" };
    const response = await createProductApi({ body: JSON.stringify(product) });

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        message: mockErrorMessage,
      }),
    });
  });
});
