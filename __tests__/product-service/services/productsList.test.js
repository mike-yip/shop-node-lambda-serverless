"use strict";

import { getProducts } from "../../../src/product-service/models/product";
import { getProductsList } from "../../../src/product-service/services/productsList";

jest.mock("../../../src/product-service/models/product", () => {
  return {
    getProducts: jest.fn(() => {
      return Promise.resolve(["abc", "xyz"]);
    }),
  };
});

describe("services/productsList.js", () => {
  test("getProductsList", async () => {
    const products = await getProductsList();
    expect(products).toEqual({
      statusCode: 200,
      body: JSON.stringify(["abc", "xyz"]),
    });
  });
});
