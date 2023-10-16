import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { ProductService } from "src/core/services/products.service";
import schema from "./schema";
import { convertServiceResponseToRecord } from "src/core/util/data.util";

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
  const productResponse = await productService.getById(productId);

  if (!productResponse.success && !productResponse.error) {
    statusCode = 404;
    // return {
    //   statusCode: 404,
    //   body: JSON.stringify({
    //     message: "There is no product found with the given ID.",
    //     data: null,
    //   }),
    // };
  }
  if (!productResponse.success && productResponse.error) {
    statusCode = 500;
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify(productResponse),
    // };
  }

  return formatJSONResponse(convertServiceResponseToRecord(productResponse), statusCode);
};

export const main = middyfy(getProductById);
