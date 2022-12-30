"use strict";

import { getProducts } from "../../src/utils/product";
import { getProductsList } from "../../src/services/productsList";

jest.mock("../../src/utils/product", () => {
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
