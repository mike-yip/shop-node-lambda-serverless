"use strict";

import AWS from "aws-sdk";
const docClient = new AWS.DynamoDB.DocumentClient();

const getProductsTableName = () => process.env["PRODUCTS_TABLE_NAME"];

const getStocksTableName = () => process.env["STOCKS_TABLE_NAME"];

export const getProducts = async () => {
  // get all products
  const productsPromise = docClient
    .scan({
      TableName: getProductsTableName(),
    })
    .promise();

  // get all stocks
  const stocksPromise = docClient
    .scan({
      TableName: getStocksTableName(),
    })
    .promise();

  // wait for all the promises here to make sure run concurrently
  const [productsData, stocksData] = await Promise.all([
    productsPromise,
    stocksPromise,
  ]);

  const stocksCount = {}; // product_id -> count

  (stocksData.Items || []).forEach((stock) => {
    stocksCount[stock.product_id] = stock.count || 0;
  });

  const products = (productsData.Items || []).map((product) => {
    return { ...product, count: stocksCount[product.id] || 0 };
  });

  return products;
};

export const getProductById = async (productId) => {
  // get all products
  const productPromise = docClient
    .get({
      TableName: getProductsTableName(),
      Key: {
        id: productId,
      },
    })
    .promise();

  // get all stocks
  const stockPromise = docClient
    .get({
      TableName: getStocksTableName(),
      Key: {
        product_id: productId,
      },
    })
    .promise();

  // wait for all the promises here to make sure run concurrently
  const [productData, stockData] = await Promise.all([
    productPromise,
    stockPromise,
  ]);

  const product = productData.Item;
  const stock = stockData.Item;

  return product ? { ...product, count: stock?.count || 0 } : null;
};
