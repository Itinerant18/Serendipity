import { start } from './build/server/index.js';

console.log("🚀 Initializing server via runner...");

start().then((server) => {
    console.log("✅ Server started successfully.");
}).catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
