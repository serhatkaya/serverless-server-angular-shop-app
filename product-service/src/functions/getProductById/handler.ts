import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { ProductService } from "src/core/services";
import { convertServiceResponseToRecord } from "src/core/util";
import schema from "./schema";

const productService = new ProductService();

const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { productId } = event.pathParameters;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide a valid ID",
        data: null,
      }),
    };
  }
  let statusCode = 200;
  const productResponse = await productService.getByIdWithStocks(productId);

  if (!productResponse.success && !productResponse.error) {
    statusCode = 404;
  }
  if (!productResponse.success && productResponse.error) {
    statusCode = 500;
  }

  return formatJSONResponse(
    convertServiceResponseToRecord(productResponse),
    statusCode
  );
};

export const main = middyfy(getProductById);
