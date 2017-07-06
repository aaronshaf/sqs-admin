[![Build Status](https://travis-ci.org/aaronshaf/sqs-admin.svg?branch=master)](https://travis-ci.org/aaronshaf/sqs-admin)
[![npm version](https://img.shields.io/npm/v/sqs-admin.svg)](https://www.npmjs.com/package/sqs-admin)
[![npm downloads](https://img.shields.io/npm/dm/sqs-admin.svg?style=flat-square)](http://npm-stat.com/charts.html?package=sqs-admin&from=2016-10-01)
[![dependencies](https://david-dm.org/aaronshaf/sqs-admin.svg)](https://david-dm.org/aaronshaf/sqs-admin)
[![npm devDependencies](https://img.shields.io/david/dev/aaronshaf/sqs-admin.svg)](https://david-dm.org/aaronshaf/sqs-admin)
[![npm license](https://img.shields.io/npm/l/sqs-admin.svg)](https://www.npmjs.org/package/sqs-admin)

## SQS-admin

### Install
```
npm install sqs-admin -g
```

### Use
```
env AWS_ACCESS_KEY_ID="my_access_key" env AWS_SECRET_ACCESS_KEY="my_secret_access_key" env SQS_ENDPOINT="http://localhost:9494" env AWS_REGION="eu-west-1" sqs-admin
```
Available environment variables:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- SQS_ENDPOINT
- SQS_ADMIN_PORT
