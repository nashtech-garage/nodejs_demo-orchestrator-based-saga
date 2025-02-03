// file orchestrator_service.js
const amqp = require('amqplib');
 
async function orchestratorService() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('orchestrator');
 
  console.log('Orchestrator is running...');
 
  // Listen for responses from services
  channel.consume('orchestrator', async (msg) => {
    const { step, status, data } = JSON.parse(msg.content.toString());
 
    if (status === 'success') {
      if (step === 'orderCreated') {
        console.log('Order created, proceeding to payment...');
        channel.sendToQueue('payment', Buffer.from(JSON.stringify({ action: 'processPayment', data })));
      } else if (step === 'paymentProcessed') {
        console.log('Payment processed, proceeding to inventory...');
        channel.sendToQueue('inventory', Buffer.from(JSON.stringify({ action: 'reserveStock', data })));
      } else if (step === 'stockReserved') {
        console.log('Stock reserved, sending notification...');
        channel.sendToQueue('notification', Buffer.from(JSON.stringify({ action: 'sendNotification', data })));
      }
    } else {
      console.error(`Error in ${step}, compensating...`);
      if (step === 'paymentProcessed') {
        console.log('Refunding payment...');
        channel.sendToQueue('payment', Buffer.from(JSON.stringify({ action: 'refundPayment', data })));
      } else if (step === 'stockReserved') {
        console.log('Releasing stock...');
        channel.sendToQueue('inventory', Buffer.from(JSON.stringify({ action: 'releaseStock', data })));
      }
    }
 
    channel.ack(msg);
  });
 
  // Start the saga by sending the first message
  const orderData = { orderId: 1, customer: 'John Doe', amount: 100 };
  channel.sendToQueue('order', Buffer.from(JSON.stringify({ action: 'createOrder', data: orderData })));
}
 
orchestratorService();
