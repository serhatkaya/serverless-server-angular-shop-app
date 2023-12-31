export const requestLogger = (request) => {
  if (request.event) {
    try {
      const pathParams = request.event?.pathParameters || {};
      const queryParams = request.event?.queryStringParameters || {};

      const pathParamsString = Object.keys(pathParams)
        .map((key) => `${key}: ${pathParams[key]}`)
        .join(", ");
      const queryParamsString = Object.keys(queryParams)
        .map((key) => `${key}: ${queryParams[key]}`)
        .join(", ");

      console.log(
        `[REQUEST-LOGGER] [${request.event.httpMethod}]${request.event.path}: Query=${queryParamsString} | PathParameters=${pathParamsString}`,
        request
      );
    } catch (error) {
      console.error("Error while logging request", error);
    }
  }
};
