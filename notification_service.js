// file notification_service.js
const amqp = require('amqplib');

async function notificationService() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('notification');
 
  console.log('Notification Service is running...');
 
  channel.consume('notification', (msg) => {
    const { action, data } = JSON.parse(msg.content.toString());
 
    if (action === 'sendNotification') {
      console.log(`Sending confirmation email for order ${data.orderId}...`);
      console.log('Notification sent successfully.');
    }
 
    channel.ack(msg);
  });
}
 
notificationService();
