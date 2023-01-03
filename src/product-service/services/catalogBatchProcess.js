"use strict";
import { createProduct } from "../models/product";

export const catalogBatchProcessApi = async (event) => {
  for (const { body } of event?.Records || []) {
    const product = JSON.parse(body);
    const response = await createProduct({
      ...product,
      price: parseInt(product.price, 10),
      count: parseInt(product.count, 10),
    });

    if (!response.created) {
      throw new Error(response.message);
    }
  }
};
