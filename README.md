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
