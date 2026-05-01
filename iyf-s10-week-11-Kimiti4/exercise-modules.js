/**
 * 🔹 Task 19.1: Built-in Modules Demo
 */
const fs = require('fs').promises;
const path = require('path');

async function demo() {
  // File operations
  await fs.writeFile('output.txt', `Generated: ${new Date().toISOString()}\n`);
  const content = await fs.readFile('output.txt', 'utf-8');
  console.log('📄 File content:', content.trim());

  // Path utilities
  console.log('📁 Path join:', path.join(__dirname, 'src', 'data'));
  console.log('🔤 Extension:', path.extname('farm-prices.json'));

  // Process info
  console.log('🕐 Uptime:', Math.round(process.uptime()), 'seconds');
  console.log('🧠 Memory:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
}
demo();
