import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";

const getProductList: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  return formatJSONResponse({
    message: `GET PRODUCTS LIST GET METHOD`,
    event,
  });
};

export const main = middyfy(getProductList);
