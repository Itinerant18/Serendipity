// Resilient server runner that handles different export formats
// from react-router-hono-server builds

const serverModule = await import('./build/server/index.js');

console.log("🚀 Initializing server via runner...");
console.log("📦 Available exports:", Object.keys(serverModule));

// The react-router-hono-server build can export `start` as a named export
// or the server app as `default`. Handle both cases.
if (typeof serverModule.start === 'function') {
    serverModule.start().then((server) => {
        console.log("✅ Server started successfully via start().");
    }).catch((err) => {
        console.error("❌ Failed to start server via start():", err);
        process.exit(1);
    });
} else if (serverModule.default) {
    // The default export from createHonoServer is a Promise<Hono>
    // When resolved, the server is already listening (in production mode)
    const app = await serverModule.default;
    console.log("✅ Server started successfully via default export.");
} else {
    console.error("❌ No 'start' function or 'default' export found in build/server/index.js");
    console.error("Available exports:", Object.keys(serverModule));
    process.exit(1);
}
