"use strict";

import { getProducts } from "../utils/product";

export const getProductsList = async (event) => {
  const products = await getProducts();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(products),
  };
};
