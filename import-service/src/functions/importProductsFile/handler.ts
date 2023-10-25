import {
  formatJSONResponse,
  type ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { S3 } from "aws-sdk";

const s3 = new S3({ signatureVersion: "v4" });

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<any> = async (
  event
) => {
  try {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
      return formatJSONResponse(
        {
          message: "Missing parameter in the query string",
        },
        400
      );
    }
    const signedUrl = s3.getSignedUrl("putObject", {
      Bucket: process.env.IMPORT_BUCKET_NAME,
      Key: `uploaded/${fileName}`,
      Expires: 60,
    });

    return formatJSONResponse({ signedUrl }, 200);
  } catch (error) {
    return formatJSONResponse(
      {
        message: "An internal server error occurred",
        error,
      },
      500
    );
  }
};

export const main = middyfy(importProductsFile);
