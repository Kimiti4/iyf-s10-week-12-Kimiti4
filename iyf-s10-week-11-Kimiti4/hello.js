/**
 * 🔹 Task 19.1: Your First Node Script
 * Run: node hello.js arg1 arg2
 */
console.log("👋 Hello from Jamii Link KE Backend!");
console.log("📦 Node version:", process.version);
console.log("📁 Directory:", process.cwd());
console.log("💻 Platform:", process.platform);
console.log("📋 Args:", process.argv.slice(2));

// Exit handling
process.on('exit', code => console.log(`🔚 Exited with code: ${code}`));
process.on('uncaughtException', err => {
  console.error('💥 Uncaught:', err.message);
  process.exit(1);
});
