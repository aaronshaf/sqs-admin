if (process.env.NODE_ENV === 'production') {
  console.error('\x1b[31mDo not run this in production!') // red
  process.exit(1)
}

const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const path = require('path')
const errorhandler = require('errorhandler')
require('es7-object-polyfill')


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'secret',
  endpoint: process.env.SQS_ENDPOINT || 'http://localhost:9324',
  sslEnabled: process.env.SQS_ENDPOINT && process.env.SQS_ENDPOINT.indexOf('https://') === 0,
  region: process.env.AWS_REGION || 'us-east-1'
})
const sqs = new AWS.SQS()

app.set('json spaces', 2)
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(errorhandler())
app.use('/assets', express.static(path.join(__dirname, '/public')))

app.get('/', async (req, res, next) => {
  try{
    const {QueueUrls = []} = await sqs.listQueues({}).promise()
    const promises = QueueUrls.map(async (QueueUrl) => {
      const {Attributes} = await sqs.getQueueAttributes({QueueUrl, AttributeNames: ['All']}).promise()
      const arnParts = Attributes.QueueArn.split(':')
      return {
        Attributes,
        QueueUrl,
        QueueName: arnParts[arnParts.length - 1]
      }
    })
    res.render('queues', {Queues: await Promise.all(promises)})
  }catch(err){
    next(err)
  }
})

app.get('/queues/:QueueName', async (req, res, next) => {
  const {QueueName} = req.params;
  try{
    const {QueueUrl} = await sqs.getQueueUrl({QueueName}).promise()
    const {Attributes} = await sqs.getQueueAttributes({QueueUrl, AttributeNames: ['All']}).promise()
    const {Messages} = await sqs.receiveMessage({QueueUrl, AttributeNames: ['All'], MaxNumberOfMessages: 10}).promise()
    res.render('messages', {Queue: {QueueName, Attributes, Messages}})
  }catch(err){
    next(err)
  }
})

app.get('/queues/:QueueName/meta', async (req, res, next) => {
  const {QueueName} = req.params;
  try{
    const {QueueUrl} = await sqs.getQueueUrl({QueueName}).promise()
    const {Attributes} = await sqs.getQueueAttributes({QueueUrl, AttributeNames: ['All']}).promise()
    res.render('meta', {Queue: {QueueName, Attributes}})
  }catch(err){
    next(err)
  }
})

app.delete('/queues/:QueueName/messages', async (req, res, next) => {
  const {QueueName} = req.params;
  try{
    const {QueueUrl} = await sqs.getQueueUrl({QueueName}).promise()
    await sqs.purgeQueue({QueueUrl}).promise()
    res.status(204).end()
  }catch(err){
    next(err)
  }
})

app.delete('/queues/:QueueName', async (req, res, next) => {
  const {QueueName} = req.params;
  try{
    const {QueueUrl} = await sqs.getQueueUrl({QueueName}).promise()
    await sqs.deleteQueue({QueueUrl}).promise()
    res.status(204).end()
  }catch(err){
    next(err)
  }
})

const port = process.env.SQS_ADMIN_PORT || 8002
app.listen(port, () => {
  console.log(`sqs-admin listening on port http://127.0.0.1:${port}`)
})
