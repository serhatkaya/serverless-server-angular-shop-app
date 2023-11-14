import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from "aws-lambda";

const basicAuthorizer = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  let token = event.authorizationToken;
  if (!token) {
    return generatePolicy("user", false, event.methodArn);
  }

  token = token.split(" ")[1];
  const decodedValue = Buffer.from(token, "base64").toString("utf-8");
  const expectedToken = process.env.AUTHORIZATION;

  return generatePolicy(
    "user",
    decodedValue === expectedToken,
    event.methodArn
  );
};

function generatePolicy(
  principalId: string,
  effect: boolean,
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect ? "Allow" : "Deny",
          Resource: resource,
        },
      ],
    },
  };
}

export const main = basicAuthorizer;
