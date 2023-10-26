import { S3Event, S3Handler } from "aws-lambda";
import { S3 } from "aws-sdk";
import csv from "csv-parser";
import { Readable } from "stream";

const s3 = new S3();

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
        console.log(results);
      });
  }
};

export const main = importFileParser;
