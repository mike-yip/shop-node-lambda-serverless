"use strict";

import {
  getProducts,
  getProductById,
  createProduct,
} from "../../../src/product-service/models/product";
import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

jest.mock("uuid", () => {
  return {
    v4: jest.fn(() => {
      return "uuid-xyz";
    }),
  };
});

describe("utils/product.js", () => {
  const mockProducts = [
    {
      description: "Short Product Description1",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 24,
      title: "ProductOne",
    },
    {
      description: "Short Product Description7",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
      price: 15,
      title: "ProductTitle",
    },
    {
      description: "Short Product Description2",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
      price: 23,
      title: "Product",
    },
    {
      description: "Short Product Description4",
      id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
      price: 15,
      title: "ProductTest",
    },
    {
      description: "Short Product Descriptio1",
      id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      price: 23,
      title: "Product2",
    },
    {
      description: "Short Product Description7",
      id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      price: 15,
      title: "ProductName",
    },
  ];

  const mockStocks = [
    {
      product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      count: 15,
    },
    {
      product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
      count: 3,
      title: "ProductTitle",
    },
    {
      product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
      count: -2,
      title: "Product",
    },
    {
      product_id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
      count: 0,
    },
    {
      product_id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
      count: 1000,
    },
    {
      product_id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      count: 999999,
    },
  ];

  test("getProducts both products and stocks return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      let items = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        items = mockProducts;
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        items = mockStocks;

      callback(null, { Items: items });
    });

    const products = await getProducts();
    expect(products).toEqual(
      mockProducts.map((product, idx) => {
        return { ...product, count: mockStocks[idx].count };
      })
    );

    AWSMock.restore("DynamoDB.DocumentClient", "scan");
  });

  test("getProducts only products return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      let items = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        items = mockProducts;
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        items = null;

      callback(null, { Items: items });
    });

    const products = await getProducts();
    expect(products).toEqual([]);

    AWSMock.restore("DynamoDB.DocumentClient", "scan");
  });

  test("getProducts only stocks return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      let items = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"]) items = null;
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        items = mockStocks;

      callback(null, { Items: items });
    });

    const products = await getProducts();
    expect(products).toEqual([]);

    AWSMock.restore("DynamoDB.DocumentClient", "scan");
  });

  test("getProducts get products return error", async () => {
    const errorMessage = "Cannot read products";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      let items = null;
      let error = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        error = new Error(errorMessage);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        items = mockStocks;

      callback(error, { Items: items });
    });

    try {
      await getProducts();
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }

    AWSMock.restore("DynamoDB.DocumentClient", "scan");
  });

  test("getProducts get stocks return error", async () => {
    const errorMessage = "Cannot read stocks";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "scan", (params, callback) => {
      let items = null;
      let error = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        items = mockProducts;
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        error = new Error(errorMessage);

      callback(error, { Items: items });
    });

    try {
      await getProducts();
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }

    AWSMock.restore("DynamoDB.DocumentClient", "scan");
  });

  test("getProductById both products and stocks return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        item = mockProducts.find((product) => product.id === params.Key.id);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        item = mockStocks.find(
          (stock) => stock.product_id === params.Key.product_id
        );

      callback(null, { Item: item });
    });

    const productToFound = { ...mockProducts[0], count: mockStocks[0].count };
    const product = await getProductById(productToFound.id);
    expect(product).toEqual(productToFound);

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("getProducts only products return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        item = mockProducts.find((product) => product.id === params.Key.id);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        item = null;

      callback(null, { Item: item });
    });

    const productToFound = { ...mockProducts[0], count: mockStocks[0].count };
    const product = await getProductById(productToFound.id);
    expect(product).toEqual(null);

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("getProducts only stocks return data", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"]) item = null;
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        item = mockStocks.find(
          (stock) => stock.product_id === params.Key.product_id
        );

      callback(null, { Item: item });
    });

    const productToFound = { ...mockProducts[0], count: mockStocks[0].count };
    const product = await getProductById(productToFound.id);
    expect(product).toEqual(null);

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("getProductById invalid id", async () => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        item = mockProducts.find((product) => product.id === params.Key.id);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        item = mockStocks.find(
          (stock) => stock.product_id === params.Key.product_id
        );

      callback(null, { Item: item });
    });

    const product = await getProductById("abc");
    expect(product).toEqual(null);

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("getProductById get products return error", async () => {
    const errorMessage = "Cannot read product";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;
      let error = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        error = new Error(errorMessage);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        item = mockStocks.find(
          (stock) => stock.product_id === params.Key.product_id
        );

      callback(error, { Item: item });
    });

    try {
      const productToFound = { ...mockProducts[0], count: mockStocks[0].count };
      await getProductById(productToFound.id);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("getProducts get stocks return error", async () => {
    const errorMessage = "Cannot read stock";
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "get", (params, callback) => {
      let item = null;
      let error = null;

      if (params.TableName === process.env["PRODUCTS_TABLE_NAME"])
        item = mockProducts.find((product) => product.id === params.Key.id);
      else if (params.TableName === process.env["STOCKS_TABLE_NAME"])
        error = new Error(errorMessage);

      callback(error, { Item: item });
    });

    try {
      const productToFound = { ...mockProducts[0], count: mockStocks[0].count };
      await getProductById(productToFound.id);
    } catch (e) {
      expect(e.message).toEqual(errorMessage);
    }

    AWSMock.restore("DynamoDB.DocumentClient", "get");
  });

  test("createProduct succeed", async () => {
    const title = "title";
    const description = "description";
    const price = 123;
    const count = 456;
    const transactWriteSpy = jest.fn((params, callback) => {
      callback(null, {});
    });
    const productToAdd = { title, description, price, count };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "transactWrite", transactWriteSpy);

    const product = await createProduct(productToAdd);
    const uuid = uuidv4();
    expect(product).toEqual({ ...productToAdd, id: uuid });
    expect(transactWriteSpy.mock.calls[0][0]).toEqual({
      TransactItems: [
        {
          Put: {
            TableName: process.env["PRODUCTS_TABLE_NAME"],
            Item: { id: uuid, title, description, price },
            ConditionExpression: "attribute_not_exists(id)",
          },
        },
        {
          Put: {
            TableName: process.env["STOCKS_TABLE_NAME"],
            Item: { product_id: uuid, count },
            ConditionExpression: "attribute_not_exists(product_id)",
          },
        },
      ],
    });

    AWSMock.restore("DynamoDB.DocumentClient", "transactWrite");
  });

  test("createProduct failed", async () => {
    const errorMessage = "Cannot create product";
    const title = "title";
    const description = "description";
    const price = 123;
    const count = 456;
    const transactWriteSpy = jest.fn((params, callback) => {
      callback(new Error(errorMessage));
    });
    const productToAdd = { title, description, price, count };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("DynamoDB.DocumentClient", "transactWrite", transactWriteSpy);

    try {
      await createProduct(productToAdd);
    } catch (e) {
      const uuid = uuidv4();
      expect(e.message).toEqual(errorMessage);
      expect(transactWriteSpy.mock.calls[0][0]).toEqual({
        TransactItems: [
          {
            Put: {
              TableName: process.env["PRODUCTS_TABLE_NAME"],
              Item: { id: uuid, title, description, price },
              ConditionExpression: "attribute_not_exists(id)",
            },
          },
          {
            Put: {
              TableName: process.env["STOCKS_TABLE_NAME"],
              Item: { product_id: uuid, count },
              ConditionExpression: "attribute_not_exists(product_id)",
            },
          },
        ],
      });
    }

    AWSMock.restore("DynamoDB.DocumentClient", "transactWrite");
  });
});
