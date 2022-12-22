"use strict";

import { getProducts, getProductById } from "../../src/utils/product";

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

  test("getProducts", async () => {
    const products = await getProducts();
    expect(products).toEqual(mockProducts);
  });

  test('getProductById with valid id', async() => {
    const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80aa';
    const product = await getProductById(productId);
    expect(product).toEqual(mockProducts.find((p) => p.id === productId));
  });

  test('getProductById with not exist id', async() => {
    const product = await getProductById('abc');
    expect(product).toEqual(null);
  });

  test('getProductById with undefined id', async() => {
    const product = await getProductById();
    expect(product).toEqual(null);
  });
});
