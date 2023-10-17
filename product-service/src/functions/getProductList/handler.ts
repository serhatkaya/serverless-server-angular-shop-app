import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { ProductService } from "src/core/services";
import schema from "./schema";

const productService = new ProductService();

const getProductList: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const productsResponse = await productService.getAllWithStocks();

  if (!productsResponse.success) {
    return {
      statusCode: 500,
      body: JSON.stringify(productsResponse),
    };
  }

  return formatJSONResponse({ ...productsResponse, event });
};

export const main = middyfy(getProductList);
