"use strict";

import {
  createProduct,
  sendCreateProductSnsMessage,
} from "../../../src/product-service/models/product";
import { catalogBatchProcessApi } from "../../../src/product-service/services/catalogBatchProcess";

const mockInvalidMessage = "Invalid format";

jest.mock("../../../src/product-service/models/product", () => {
  return {
    createProduct: jest.fn((obj) => {
      if (obj && obj.title)
        return Promise.resolve({ created: true, product: obj });
      else
        return Promise.resolve({ created: false, message: mockInvalidMessage });
    }),
    sendCreateProductSnsMessage: jest.fn(() => {
      return Promise.resolve();
    }),
  };
});

describe("product-service/services/createProduct.js", () => {
  test("catalogBatchProcessApi", async () => {
    const succeedProduct = {
      title: "title",
      description: "description",
      price: 123,
      count: "456",
    };

    const failedProduct = {
      description: "description",
      price: 5678,
      count: "9876",
    };

    let parseEmptyJsonError;

    try {
      JSON.parse("");
    } catch (e) {
      parseEmptyJsonError = e.message;
    }

    const event = {
      Records: [
        {
          body: JSON.stringify(succeedProduct),
        },
        {
          body: JSON.stringify(failedProduct),
        },
        {
          body: "",
        },
      ],
    };

    const productsCreated = [
      JSON.stringify({
        ...succeedProduct,
        price: parseInt(succeedProduct.price, 10),
        count: parseInt(succeedProduct.count, 10),
      }),
    ];

    const productsFailed = [
      { json: JSON.stringify(failedProduct), message: mockInvalidMessage },
      { json: "", message: parseEmptyJsonError },
    ];

    const message = `Created: ${JSON.stringify(
      productsCreated
    )}\n\nFailed: ${JSON.stringify(productsFailed)}`;

    await catalogBatchProcessApi(event);

    expect(sendCreateProductSnsMessage).toHaveBeenCalledWith(message);
  });
});
