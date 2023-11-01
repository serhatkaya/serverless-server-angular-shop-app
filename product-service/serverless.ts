import {
  catalogBatchProcess,
  createProduct,
  getProductById,
  seedData,
} from "@functions/index";
import type { AWS } from "@serverless/typescript";
import * as dotenv from "dotenv";
import {
  PRODUCT_TABLE_NAME,
  STOCK_TABLE_NAME,
  getDatabaseConfiguration,
} from "skcore";

// load env file
dotenv.config();

const [PRODUCTS_TABLE_RESOURCE, STOCKS_TABLE_RESOURCE, PRODUCT_TOPIC_RESOURCE] =
  [
    process.env.PRODUCTS_TABLE,
    process.env.STOCKS_TABLE,
    process.env.CREATE_PRODUCT_TOPIC_ARN,
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
      CREATE_PRODUCT_TOPIC_ARN: process.env.CREATE_PRODUCT_TOPIC_ARN,
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
      {
        Effect: "Allow",
        Action: ["sns:Publish"],
        Resource: [PRODUCT_TOPIC_RESOURCE],
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
    catalogBatchProcess,
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
      CatalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "CatalogItemsQueue",
        },
      },
      CreateProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          DisplayName: "Create Product Topic",
          TopicName: "createProductTopic",
        },
      },
      CreateProductTopicSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          TopicArn: {
            Ref: "CreateProductTopic",
          },
          Endpoint: process.env.EMAIL_SNS,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
