import { Context, SQSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { PRODUCT_TABLE_NAME, ProductService } from "skcore";

const productService = new ProductService(
  PRODUCT_TABLE_NAME,
  new AWS.DynamoDB(),
  new AWS.DynamoDB.DocumentClient()
);
const sns = new AWS.SNS();

export const catalogBatchProcess = async (event: SQSEvent, _: Context) => {
  try {
    for (const record of event.Records) {
      let messageBody;
      try {
        messageBody = JSON.parse(record.body);
      } catch (err) {
        console.log("Error while parsing message", err);
      }

      if (typeof messageBody == "object") {
        const product = await productService.createWithStocks({
          ...messageBody,
          stock: {
            count: messageBody.stock,
          },
        });
        console.log(product, "createdproduct");
        const snsMessage = {
          Subject: "New Products Created",
          Message: `Product created with id: ${product.data.id} - ${product.data.title}`,
          TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
        };

        await sns.publish(snsMessage).promise();
      }
    }

    console.log("SQS processing complete.");
  } catch (error) {
    console.error("Error processing SQS messages", error);
    throw error;
  }
};

export const main = catalogBatchProcess;
