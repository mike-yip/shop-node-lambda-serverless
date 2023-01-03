"use strict";

import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const getProductsTableName = () => process.env["PRODUCTS_TABLE_NAME"];

const getStocksTableName = () => process.env["STOCKS_TABLE_NAME"];

const getDynamoDBDocumentClient = (() => {
  let docClient = null;
  return () => {
    if (!docClient) docClient = new AWS.DynamoDB.DocumentClient();
    return docClient;
  };
})();

export const getProducts = async () => {
  const docClient = getDynamoDBDocumentClient();

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
    stocksCount[stock.product_id] = stock.count;
  });

  const products = (productsData.Items || [])
    .filter((product) => stocksCount[product.id] !== undefined)
    .map((product) => {
      return { ...product, count: stocksCount[product.id] };
    });

  return products;
};

export const getProductById = async (productId) => {
  const docClient = getDynamoDBDocumentClient();

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

  return product && stock ? { ...product, count: stock.count } : null;
};

export const createProduct = async (product) => {
  const uuid = uuidv4();
  const { title, description, price, count } = product;
  const docClient = getDynamoDBDocumentClient();

  const params = {
    TransactItems: [
      {
        Put: {
          TableName: getProductsTableName(),
          Item: {
            id: uuid,
            title: title,
            description: description,
            price: price,
          },
          ConditionExpression: "attribute_not_exists(id)",
        },
      },
      {
        Put: {
          TableName: getStocksTableName(),
          Item: {
            product_id: uuid,
            count: count,
          },
          ConditionExpression: "attribute_not_exists(product_id)",
        },
      },
    ],
  };

  await docClient.transactWrite(params).promise();

  return { ...product, count: count, id: uuid };
};
