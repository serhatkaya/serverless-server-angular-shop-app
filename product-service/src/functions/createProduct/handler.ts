import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import {
  ProductService,
  Product,
  convertServiceResponseToRecord,
  PRODUCT_TABLE_NAME,
} from "skcore";
import schema from "./schema";
import * as AWS from "aws-sdk";

const productService = new ProductService(
  PRODUCT_TABLE_NAME,
  new AWS.DynamoDB(),
  new AWS.DynamoDB.DocumentClient()
);

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const body = event.body as unknown as Product;

  if (!body) {
    return formatJSONResponse(
      {
        data: null,
        message: "Please provide valid product data",
      },
      400
    );
  }

  const productResponse = await productService.createWithStocks({
    ...body,
    id: productService.getUniqueId(),
  });

  if (!productResponse.success) {
    return formatJSONResponse(
      convertServiceResponseToRecord(productResponse),
      productResponse.error ? 500 : 400
    );
  }

  return formatJSONResponse(
    convertServiceResponseToRecord(productResponse),
    201
  );
};

export const main = middyfy(createProduct);
