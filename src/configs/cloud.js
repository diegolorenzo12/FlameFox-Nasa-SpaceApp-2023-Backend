//Cloud provider configurations

const AZURE_ACCOUNT_NAME = process.env.AZURE_ACCOUNT_NAME
const AZURE_ACCOUNT_KEY = process.env.AZURE_ACCOUNT_KEY
const AZURE_BLOCK_CONTAINER = process.env.AZURE_BLOCK_CONTAINER
const HF_KEY = process.env.HF_KEY
const CLASSIFIER_MODEL_URL = process.env.CLASSIFIER_MODEL_URL

module.exports = {
    AZURE_ACCOUNT_NAME, 
    AZURE_ACCOUNT_KEY,
    AZURE_BLOCK_CONTAINER,
    HF_KEY,
    CLASSIFIER_MODEL_URL
}
