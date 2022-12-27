"use strict";

import { getProducts } from "../utils/product";

export const getProductsList = async (event) => {
  const products = await getProducts();

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
