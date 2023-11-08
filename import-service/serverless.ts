import { importFileParser, importProductsFile } from "@functions/index";
import type { AWS } from "@serverless/typescript";
import * as dotenv from "dotenv";

// load env file
dotenv.config();
const [IMPORT_BUCKET_RESOURCE, CATALOG_SQS_ARN] = [
  process.env.IMPORT_BUCKET_ARN,
  process.env.CATALOG_SQS_ARN,
];

const serverlessConfiguration: AWS = {
  service: "import-service",
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
      IMPORT_BUCKET_NAME: process.env.IMPORT_BUCKET_NAME,
      PRODUCT_SQS_URL: process.env.PRODUCT_SQS_URL,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: IMPORT_BUCKET_RESOURCE,
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: `${IMPORT_BUCKET_RESOURCE}/*`,
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: `${IMPORT_BUCKET_RESOURCE}/*`,
      },
      {
        Effect: "Allow",
        Action: ["sqs:ListQueues", "sqs:ReceiveMessage", "sqs:SendMessage"],
        Resource: CATALOG_SQS_ARN,
      },
    ],
  },
  // import the function via paths
  functions: {
    importProductsFile,
    importFileParser: {
      ...importFileParser,
      events: [
        {
          s3: {
            bucket: process.env.IMPORT_BUCKET_NAME,
            event: "s3:ObjectCreated:*",
            rules: [
              {
                prefix: "uploaded",
              },
              {
                suffix: ".csv",
              },
            ],
          },
        },
      ],
    },
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
  resources: {},
};

module.exports = serverlessConfiguration;
