const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
require("dotenv").config();

//connecto to azure blob storage
const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_ACCOUNT_NAME,
  process.env.AZURE_ACCOUNT_KEY
);
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.CONTAINER_NAME
);

module.exports = containerClient;
