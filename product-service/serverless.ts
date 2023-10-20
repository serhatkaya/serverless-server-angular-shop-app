import createProduct from "@functions/createProduct";
import getProductById from "@functions/getProductById";
import seedData from "@functions/seedData";
import type { AWS } from "@serverless/typescript";
import * as dotenv from "dotenv";
import {
  getDatabaseConfiguration,
  PRODUCT_TABLE_NAME,
  STOCK_TABLE_NAME,
} from "src/core/util";

// load env file
dotenv.config();

const [PRODUCTS_TABLE_RESOURCE, STOCKS_TABLE_RESOURCE] = [
  process.env.PRODUCTS_TABLE,
  process.env.STOCKS_TABLE,
];

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
          "dynamodb:BatchGetItem",
        ],
        Resource: [PRODUCTS_TABLE_RESOURCE, STOCKS_TABLE_RESOURCE],
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
    createProduct,
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
    },
  },
};

module.exports = serverlessConfiguration;
