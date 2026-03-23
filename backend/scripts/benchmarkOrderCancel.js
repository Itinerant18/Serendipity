const { supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');

async function benchmark() {
  const stockClient = supabaseSellerAdmin || supabaseSeller;

  const N = 50;
  const items = Array.from({length: N}, (_, i) => ({
    product_id: `prod-id-${i}`,
    qty: 1
  }));

  // Create mock that adds a bit of realistic latency (e.g., 5ms per network hop)
  const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));
  const DELAY_MS = 5;

  const mockStockClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
            single: async () => {
                await networkDelay(DELAY_MS);
                return { data: { count_in_stock: 10 } };
            }
        }),
        in: async () => {
            await networkDelay(DELAY_MS);
            return { data: items.map(item => ({ id: item.product_id, count_in_stock: 10 })) };
        }
      }),
      update: () => ({
        eq: async () => {
            await networkDelay(DELAY_MS);
            return { error: null };
        }
      }),
      upsert: async () => {
          await networkDelay(DELAY_MS);
          return { error: null };
      }
    })
  };


  console.time('N+1 Query Update');

  for (const item of items) {
    const { data: prod } = await mockStockClient
      .from("products")
      .select("count_in_stock")
      .eq("id", item.product_id)
      .single();
    if (prod) {
      await mockStockClient
        .from("products")
        .update({ count_in_stock: (prod.count_in_stock || 0) + item.qty })
        .eq("id", item.product_id);
    }
  }

  console.timeEnd('N+1 Query Update');

  console.time('Optimized Bulk Query Update');

  const productIds = items.map(i => i.product_id);
  const { data: products } = await mockStockClient
      .from("products")
      .select("id, count_in_stock")
      .in("id", productIds);

  if (products && products.length > 0) {
      const updates = products.map(prod => {
          const item = items.find(i => i.product_id === prod.id);
          return {
              id: prod.id,
              count_in_stock: (prod.count_in_stock || 0) + (item ? item.qty : 0)
          };
      });

      await mockStockClient
          .from("products")
          .upsert(updates);
  }

  console.timeEnd('Optimized Bulk Query Update');

  process.exit(0);
}

benchmark().catch(console.error);
