import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

const requestLogger = (request) => {
  console.log(
    `Request ${request.event.path}:[${
      request.event.httpMethod
    }] Params | ${JSON.stringify(request.event.queryStringParameters)}`
  );

  return request;
};

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser());
};
