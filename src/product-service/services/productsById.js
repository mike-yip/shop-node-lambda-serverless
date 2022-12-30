"use strict";

import { getProductById } from "../models/product";

export const getProductsById = async (event) => {
  const productId = event.pathParameters.productId || null;
  let product = undefined;

  if (productId) {
    product = await getProductById(productId);
  }

  if (product) {
    return {
      statusCode: 200,
      body: JSON.stringify(product),
    };
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Product not found",
      }),
    };
  }
};
