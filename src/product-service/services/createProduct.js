"use strict";

import { createProduct } from "../models/product";

export const createProductApi = async (event) => {
  const productToAdd = JSON.parse(event.body);
  const { created, message, product: productAdded } = await createProduct(productToAdd);

  if (created) {
    return {
      statusCode: 200,
      body: JSON.stringify(productAdded),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: message,
      }),
    };
  }
};
