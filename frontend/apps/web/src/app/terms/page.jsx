"use client";

import React from "react";
import PolicyLayout from "@/components/layout/PolicyLayout";

export default function TermsOfService() {
    return (
        <PolicyLayout title="Terms of Service" lastUpdated="January 26, 2026" type="terms">
            <p className="lead">
                Please read these Terms of Service carefully ("Terms", "Terms of Service") before using the Serendipity website operated by Serendipity Inc.
            </p>

            <section className="my-8">
                <h3>1. Conditions of Use</h3>
                <p>
                    By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly. Serendipity only grants use and access of this website, its products, and its services to those who have accepted its terms.
                </p>
            </section>

            <section className="mb-8">
                <h3>2. Intellectual Property</h3>
                <p>
                    You agree that all materials, products, and services provided on this website are the property of Serendipity, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the Serendipity’s intellectual property in any way, including electronic, digital, or new trademark registrations.
                </p>
            </section>

            <section className="mb-8">
                <h3>3. User Accounts</h3>
                <p>
                    As a user of this website, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password.
                </p>
            </section>
        </PolicyLayout>
    );
}
