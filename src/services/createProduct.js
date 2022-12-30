"use strict";

import { createProduct } from "../utils/product";

const isValidProduct = (product) => {
  if (!product?.title) return false;

  if (!Number.isInteger(product?.price)) return false;

  return true;
};

export const createProductApi = async (event) => {
  const productToAdd = JSON.parse(event?.body || "{}");

  if (isValidProduct(productToAdd)) {
    const productAdded = await createProduct(productToAdd);

    return {
      statusCode: 200,
      body: JSON.stringify(productAdded),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid format",
      }),
    };
  }
};
