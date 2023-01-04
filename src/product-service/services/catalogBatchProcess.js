"use strict";
import { createProduct } from "../models/product";
import AWS from "aws-sdk";

const getCreateProductTopicArn = () => process.env["CREATE_PRODUCT_TOPIC_ARN"];

const getSnsInstance = (() => {
  let sns = null;
  return () => {
    if (!sns) sns = new AWS.SNS();
    return sns;
  };
})();

const sendSnsMessage = async (productsCreated, productsFailed) => {
  const message = `Created: ${JSON.stringify(productsCreated)}\n\nFailed: ${JSON.stringify(productsFailed)}`;

  var params = {
    Message: message,
    TopicArn: getCreateProductTopicArn(),
  };

  const sns = getSnsInstance();

  await sns.publish(params).promise();
};

export const catalogBatchProcessApi = async (event) => {
  const productsCreated = []; // [product in JSON, ...]
  const productsFailed = []; // [{ product in json, message }, ...]

  const addFailedProduct = (productJson, message) => {
    productsFailed.push({ json: productJson, message });
  };

  for (const { body } of event?.Records || []) {
    try {
      const product = JSON.parse(body);
      const productToAdd = {
        ...product,
        price: parseInt(product.price, 10),
        count: parseInt(product.count, 10),
      };

      const response = await createProduct(productToAdd);

      if (response.created) {
        productsCreated.push(JSON.stringify(productToAdd));
      } else {
        addFailedProduct(body, response.message);
      }
    } catch (e) {
      addFailedProduct(body, e.message);
    }
  }

  await sendSnsMessage(productsCreated, productsFailed);
};
