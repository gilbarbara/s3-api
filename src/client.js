require("dotenv").config();

const S3 = require("aws-sdk/clients/s3");

const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME } = process.env;

const s3 = new S3({
  apiVersion: "2006-03-01",
  region: "us-east-2",
  accessKeyId: ACCESS_KEY_ID || AWS_ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY || AWS_SECRET_ACCESS_KEY,
});

module.exports = class Client {
  constructor() {
    if ((!ACCESS_KEY_ID && !AWS_ACCESS_KEY_ID) || (!SECRET_ACCESS_KEY && !AWS_SECRET_ACCESS_KEY) || !BUCKET_NAME) {
      throw new Error("Missing environment variables");
    }
  }

  async load(key) {
    if (!key) {
      throw new Error("Missing required parameters");
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    try {
      const response = await s3.getObject(params).promise();
      
      return JSON.parse(response.Body.toString());
    } catch (error) {
      if (error.code === "NoSuchKey") return false;

      throw new Error(error);
    }
  }

  async save(key, data = []) {
    if (!key) {
      throw new Error("Missing required parameters");
    }

    const Data = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      CacheControl: "max-age=31536000,public"
    };

    return await s3
      .putObject(Data, error => {
        if (error) {
          throw new Error(error);
        }
      })
      .promise();
  }
};
