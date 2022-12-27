"use strict";

import {
  getProducts as getProductsFromDb,
  getProductById as getProductByIdFromDb,
} from "./database";

export const getProducts = async () => {
  return await getProductsFromDb();
};

export const getProductById = async (productId) => {
  return await getProductByIdFromDb(productId);
};
