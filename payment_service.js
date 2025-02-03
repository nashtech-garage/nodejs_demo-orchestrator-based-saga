// file payment_service.js
const amqp = require('amqplib');

async function paymentService() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('payment');
 
  console.log('Payment Service is running...');
 
  channel.consume('payment', (msg) => {
    const { action, data } = JSON.parse(msg.content.toString());
 
    if (action === 'processPayment') {
      console.log(`Processing payment for order ${data.orderId}...`);
      // Simulate success
      const response = { step: 'paymentProcessed', status: 'success', data };
      channel.sendToQueue('orchestrator', Buffer.from(JSON.stringify(response)));
    } else if (action === 'refundPayment') {
      console.log(`Refunding payment for order ${data.orderId}...`);
    }
 
    channel.ack(msg);
  });
}
 
paymentService();
