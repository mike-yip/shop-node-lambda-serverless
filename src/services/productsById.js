"use strict";

import { getProductById } from "../utils/product";

export const getProductsById = async (event) => {
  const productId = event.pathParameters.productId || null;
  let product = undefined;

  if (productId) {
    product = await getProductById(productId);
  }

  if (product) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(product),
    };
  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: "Product not found",
      }),
    };
  }
};
