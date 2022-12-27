"use strict";

import { getProducts } from "../utils/product";

export const getProductsList = async (event) => {
  try {
    const products = await getProducts();

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: e.message,
      }),
    };
  }
};
