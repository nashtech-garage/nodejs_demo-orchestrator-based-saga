// file inventory_service.js
const amqp = require('amqplib');

async function inventoryService() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  await channel.assertQueue('inventory');
 
  console.log('Inventory Service is running...');
 
  channel.consume('inventory', (msg) => {
    const { action, data } = JSON.parse(msg.content.toString());
 
    if (action === 'reserveStock') {
      console.log(`Reserving stock for order ${data.orderId}...`);
      // Simulate success
      const response = { step: 'stockReserved', status: 'success', data };
      channel.sendToQueue('orchestrator', Buffer.from(JSON.stringify(response)));
    } else if (action === 'releaseStock') {
      console.log(`Releasing stock for order ${data.orderId}...`);
    }
 
    channel.ack(msg);
  });
}
 
inventoryService();