// Mock orderItems
const orderItems = Array.from({ length: 50 }, (_, i) => ({ product_id: `prod_${i}`, qty: 1 }));

// Mock stockClient
const mockStockClient = {
    from: (table) => ({
        select: (cols) => ({
            eq: (col, val) => ({
                single: async () => {
                    await new Promise(r => setTimeout(r, 10)); // 10ms network latency
                    return { data: { id: val, count_in_stock: 10 } };
                }
            }),
            in: (col, vals) => {
                return (async () => {
                    await new Promise(r => setTimeout(r, 10)); // 10ms network latency
                    return { data: vals.map(v => ({ id: v, count_in_stock: 10 })) };
                })();
            }
        }),
        update: (data) => ({
            eq: (col, val) => {
                return (async () => {
                    await new Promise(r => setTimeout(r, 10)); // 10ms network latency
                    return { data: null };
                })();
            }
        })
    })
};

const newStatus = 'STOCK_DEDUCT_ON';
const STOCK_DEDUCT_ON = 'STOCK_DEDUCT_ON';

async function runOriginal() {
    console.log('Running original...');
    const start = Date.now();
    const stockClient = mockStockClient;

    if (newStatus === STOCK_DEDUCT_ON) {
        for (const item of orderItems) {
            const { data: prod } = await stockClient
                .from('products')
                .select('count_in_stock')
                .eq('id', item.product_id)
                .single();
            if (prod) {
                const newStock = Math.max(0, (prod.count_in_stock || 0) - item.qty);
                await stockClient.from('products')
                    .update({ count_in_stock: newStock })
                    .eq('id', item.product_id);
            }
        }
    }

    console.log(`Original took: ${Date.now() - start}ms`);
}

async function runOptimized() {
    console.log('Running optimized...');
    const start = Date.now();
    const stockClient = mockStockClient;

    if (newStatus === STOCK_DEDUCT_ON) {
        // Aggregate quantities in case of duplicate products
        const qtyByProduct = {};
        for (const item of orderItems) {
            qtyByProduct[item.product_id] = (qtyByProduct[item.product_id] || 0) + item.qty;
        }
        const productIds = Object.keys(qtyByProduct);

        if (productIds.length > 0) {
            // 1. Bulk read
            const { data: products } = await stockClient
                .from('products')
                .select('id, count_in_stock')
                .in('id', productIds);

            if (products && products.length > 0) {
                // 2. Concurrent updates
                const updatePromises = products.map(prod => {
                    const deductQty = qtyByProduct[prod.id];
                    if (!deductQty) return Promise.resolve();

                    const newStock = Math.max(0, (prod.count_in_stock || 0) - deductQty);
                    return stockClient.from('products')
                        .update({ count_in_stock: newStock })
                        .eq('id', prod.id);
                });

                await Promise.all(updatePromises);
            }
        }
    }

    console.log(`Optimized took: ${Date.now() - start}ms`);
}

async function run() {
    await runOriginal();
    await runOptimized();
}

run();
