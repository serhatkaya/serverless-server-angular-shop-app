import type { AWS } from "@serverless/typescript";

import getProductById from "@functions/getProductById";
import seedData from "@functions/seedData";
import { PRODUCT_TABLE_NAME, STOCK_TABLE_NAME } from "src/core/util/globals";
import { getDatabaseConfiguration } from "src/core/util/resource.util";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-offline", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
        ],
        Resource: [
          "arn:aws:dynamodb:us-east-1:239415430731:table/products",
          "arn:aws:dynamodb:us-east-1:239415430731:table/stocks",
        ],
      },
    ],
  },
  // import the function via paths
  functions: {
    getProductList: {
      handler: "src/functions/getProductList/handler.main",
      events: [
        {
          http: {
            method: "get",
            path: "products",
            cors: {
              origins: ["*"],
              allowCredentials: true,
              methods: ["ANY"],
            },
          },
        },
      ],
    },
    getProductById,
    seedData,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ...getDatabaseConfiguration(
        PRODUCT_TABLE_NAME,
        [
          {
            AttributeName: "id",
            AttributeType: "S",
          },
        ],
        [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
        ]
      ),
      ...getDatabaseConfiguration(
        STOCK_TABLE_NAME,
        [
          {
            AttributeName: "product_id",
            AttributeType: "S",
          },
        ],
        [
          {
            AttributeName: "product_id",
            KeyType: "HASH",
          },
        ]
      ),
      // [PRODUCT_TABLE_NAME]: {
      //   Type: "AWS::DynamoDB::Table",
      //   Properties: {
      //     TableName: "products",
      //     AttributeDefinitions: [
      //       {
      //         AttributeName: "id",
      //         AttributeType: "S",
      //       },
      //     ],
      //     KeySchema: [
      //       {
      //         AttributeName: "id",
      //         KeyType: "HASH",
      //       },
      //     ],
      //     ProvisionedThroughput: {
      //       ReadCapacityUnits: 1,
      //       WriteCapacityUnits: 1,
      //     },
      //   },
      // },
    },
  },
};

module.exports = serverlessConfiguration;
