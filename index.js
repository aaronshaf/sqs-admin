const express = require('express')
const AWS = require('aws-sdk')
const promisify = require('es6-promisify')
const path = require('path')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')

require('es7-object-polyfill')

if (process.env.NODE_ENV === 'production') {
  console.error('\x1b[31mDo not run this in production!') // red
  process.exit(1)
}

const app = express()
app.set('json spaces', 2)
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'secret',
  endpoint: process.env.SQS_ENDPOINT || 'http://localhost:9324',
  sslEnabled: process.env.SQS_ENDPOINT && process.env.SQS_ENDPOINT.indexOf('https://') === 0,
  region: process.env.AWS_REGION || 'us-east-1'
})

const sqs = new AWS.SQS()

app.use(errorhandler())
app.use('/assets', express.static(path.join(__dirname, '/public')))

app.get('/', (req, res, next) => {
  sqs.listQueues({}).promise()
  .then((data) => {
    const promises = (data.QueueUrls || []).map((QueueUrl) => {
      return sqs.getQueueAttributes({QueueUrl, AttributeNames: ['All']}).promise()
      .then((response) => {
        const arnParts = response.Attributes.QueueArn.split(':')
        return Object.assign({}, response, {
          QueueUrl,
          QueueName: arnParts[arnParts.length - 1]
        })
      })
    })
    return Promise.all(promises).then((data) => {
      res.render('queues', {data})
    })
  })
  .catch(next)
})

app.get('/queues/:QueueName', (req, res, next) => {
  sqs.getQueueUrl({ QueueName: req.params.QueueName }).promise()
  .then((response) => {
    return sqs.getQueueAttributes({
      QueueUrl: response.QueueUrl,
      AttributeNames: ['All']
    }).promise()
    .then((attributes) => {
      return sqs.receiveMessage({
        QueueUrl: response.QueueUrl,
        AttributeNames: ['All'],
        MaxNumberOfMessages: 10
      }).promise().then((response) => {
        const Queue = Object.assign({}, {
          QueueName: req.params.QueueName,
        }, attributes, response)
        res.render('messages', {Queue})
      })
    })
  })
  .catch(next)
})

app.get('/queues/:QueueName/meta', (req, res, next) => {
  sqs.getQueueUrl({ QueueName: req.params.QueueName }).promise()
  .then((response) => {
    return sqs.getQueueAttributes({
      QueueUrl: response.QueueUrl,
      AttributeNames: ['All']
    }).promise()
  })
  .then((response) => {
    const Queue = Object.assign({}, {
      QueueName: req.params.QueueName
    }, response)
    res.render('meta', {Queue})
  })
  .catch(next)
})

app.delete('/queues/:QueueName/messages', (req, res, next) => {
  sqs.getQueueUrl({ QueueName: req.params.QueueName }).promise()
  .then((response) => {
    return sqs.purgeQueue({ QueueUrl: response.QueueUrl }).promise()
  })
  .then((response) => {
    res.status(204).end()
  })
  .catch(next)
})

app.delete('/queues/:QueueName', (req, res, next) => {
  sqs.getQueueUrl({ QueueName: req.params.QueueName }).promise()
  .then((response) => {
    return sqs.deleteQueue({ QueueUrl: response.QueueUrl }).promise()
  })
  .then((response) => {
    res.status(204).end()
  })
  .catch(next)
})

const port = process.env.PORT || 8002
app.listen(port, () => {
  console.log(`sqs-admin listening on port ${port}`)
})
