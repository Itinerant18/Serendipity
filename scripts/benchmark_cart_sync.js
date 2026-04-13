const { performance } = require('perf_hooks');

// Mock SQL utility
let callCount = 0;
const mockSql = async (strings, ...values) => {
  callCount++;
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 50));
  return [];
};

async function benchmarkCurrent(items) {
  const userId = 'user-123';
  callCount = 0;
  const start = performance.now();

  // Simulated DELETE
  await mockSql`DELETE FROM saved_carts WHERE user_id = ${userId}`;

  // Simulated INSERT loop (N+1)
  if (items && items.length > 0) {
    for (const item of items) {
      await mockSql`
        INSERT INTO saved_carts (user_id, product_id, product_title, price, image_url, quantity)
        VALUES (${userId}, ${item.product_id}, ${item.title}, ${item.price}, ${item.image}, ${item.quantity})
      `;
    }
  }

  const end = performance.now();
  return {
    time: end - start,
    calls: callCount
  };
}

async function benchmarkOptimized(items) {
  const userId = 'user-123';
  callCount = 0;
  const start = performance.now();

  // Simulated DELETE
  await mockSql`DELETE FROM saved_carts WHERE user_id = ${userId}`;

  // Simulated Bulk INSERT
  if (items && items.length > 0) {
    const productIds = items.map((item) => item.product_id);
    const titles = items.map((item) => item.title);
    const prices = items.map((item) => item.price);
    const images = items.map((item) => item.image);
    const quantities = items.map((item) => item.quantity);

    await mockSql`
      INSERT INTO saved_carts (user_id, product_id, product_title, price, image_url, quantity)
      SELECT ${userId}, * FROM UNNEST(
        ${productIds}::text[],
        ${titles}::text[],
        ${prices}::text[],
        ${images}::text[],
        ${quantities}::int[]
      )
    `;
  }

  const end = performance.now();
  return {
    time: end - start,
    calls: callCount
  };
}

// Run benchmarks
const itemsCount = 20;
const items = Array.from({ length: itemsCount }, (_, i) => ({
  product_id: `prod-${i}`,
  title: `Product ${i}`,
  price: (Math.random() * 100).toFixed(2),
  image: `http://example.com/image-${i}.jpg`,
  quantity: Math.floor(Math.random() * 5) + 1
}));

async function run() {
  console.log(`\n--- Benchmarking approach with ${itemsCount} items ---`);

  const current = await benchmarkCurrent(items);
  console.log(`[Current N+1]`);
  console.log(`  Time taken: ${current.time.toFixed(2)}ms`);
  console.log(`  Database calls: ${current.calls}`);

  const optimized = await benchmarkOptimized(items);
  console.log(`\n[Optimized Bulk]`);
  console.log(`  Time taken: ${optimized.time.toFixed(2)}ms`);
  console.log(`  Database calls: ${optimized.calls}`);

  const timeImprovement = ((current.time - optimized.time) / current.time * 100).toFixed(2);
  const callsReduction = current.calls - optimized.calls;

  console.log(`\nSummary:`);
  console.log(`  Time reduction: ${timeImprovement}%`);
  console.log(`  Calls reduction: ${callsReduction} calls`);
}

run();
