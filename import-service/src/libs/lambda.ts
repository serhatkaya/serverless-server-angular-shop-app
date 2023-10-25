import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { requestLogger } from "skcore";

export const middyfy = (handler) => {
  return middy(handler)
    .use(middyJsonBodyParser())
    .after((request) => {
      requestLogger(request);
    });
};
