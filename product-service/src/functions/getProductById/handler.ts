import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { products } from "../common/data";
import schema from "./schema";

const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Please provide a valid ID",
        data: null,
      }),
    };
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "There is no product found with the given ID.",
        data: null,
      }),
    };
  }

  return formatJSONResponse({
    data: product,
  });
};

export const main = middyfy(getProductById);
