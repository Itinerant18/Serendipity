"use client";

import React from "react";
import PolicyLayout from "@/components/layout/PolicyLayout";

export default function SellerPolicies() {
    return (
        <PolicyLayout title="Seller Policies" lastUpdated="January 26, 2026" type="legal">
            <section className="mb-8">
                <h3>1. Selling on Serendipity</h3>
                <p>
                    Serendipity provides a marketplace for third-party sellers to sell their products to customers. By registering as a seller, you agree to comply with all applicable laws and regulations, as well as our Seller Code of Conduct.
                </p>
            </section>

            <section className="mb-8">
                <h3>2. Product Guidelines</h3>
                <p>
                    All products listed mechanism must be authentic and accurately described. Counterfeit, illegal, or prohibited items are strictly forbidden. We reserve the right to remove any listing that violates these policies.
                </p>
            </section>

            <section className="mb-8">
                <h3>3. Shipping and Fulfillment</h3>
                <p>
                    Sellers are responsible for shipping products to customers within the specified processing time. You must provide valid tracking numbers for all orders. Failure to ship on time may result in order cancellation and penalties.
                </p>
            </section>

            <section className="mb-8">
                <h3>4. Returns and Refunds</h3>
                <p>
                    Sellers must establish a clear return policy that complies with Serendipity's minimum return standards. You generally must accept returns for defective or damaged items within 30 days of delivery.
                </p>
            </section>
        </PolicyLayout>
    );
}
