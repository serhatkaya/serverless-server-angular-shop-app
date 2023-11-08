import { S3Event, S3Handler } from "aws-lambda";
import AWS, { S3 } from "aws-sdk";
import csv from "csv-parser";
import { convertCsvProductToObject } from "skcore";
import { Readable } from "stream";

const s3 = new S3();
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const importFileParser: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const s3Object = record.s3;
    const bucketName = s3Object.bucket.name;
    const objectKey = s3Object.object.key;

    console.log(`Processing S3 object: ${objectKey} in bucket: ${bucketName}`);

    const s3Response = await s3
      .getObject({ Bucket: bucketName, Key: objectKey })
      .promise();

    const s3Stream = new Readable();
    s3Stream._read = () => {};

    s3Stream.push(s3Response.Body);
    // Signal the end of the stream
    s3Stream.push(null);
    const results = [];

    s3Stream
      .pipe(csv({ headers: false, separator: "," }))
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const mappedResults = results.map(
          (data) => convertCsvProductToObject(data) as any
        );

        mappedResults.forEach((product) => {
          const sqsParams = {
            QueueUrl: process.env.PRODUCT_SQS_URL,
            MessageBody: JSON.stringify(product),
          };

          sqs.sendMessage(sqsParams, (err, data) => {
            if (err) {
              console.error("Error while sending message:", err);
            } else {
              console.log("SQS Message sent successfully!", data);
            }
          });
        });
      });
  }
};

export const main = importFileParser;
