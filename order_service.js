// file order_service.js
const amqp = require('amqplib');
 
async function orderService() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('order');
 
  console.log('Order Service is running...');
 
  channel.consume('order', (msg) => {
    const { action, data } = JSON.parse(msg.content.toString());
 
    if (action === 'createOrder') {
      console.log(`Creating order ${data.orderId}...`);
      // Simulate success
      const response = { step: 'orderCreated', status: 'success', data };
      channel.sendToQueue('orchestrator', Buffer.from(JSON.stringify(response)));
    }
 
    channel.ack(msg);
  });
}
 
orderService();
