"use client";

import React from "react";
import PolicyLayout from "@/components/layout/PolicyLayout";

export default function PrivacyPolicy() {
    return (
        <PolicyLayout title="Privacy Policy" lastUpdated="January 26, 2026" type="privacy">
            <section className="mb-8">
                <h3>1. Introduction</h3>
                <p>
                    Welcome to Serendipity. We verify your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                </p>
            </section>

            <section className="mb-8">
                <h3>2. Information We Collect</h3>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 dark:text-slate-300">
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                    <li><strong>Financial Data:</strong> includes bank account and payment card details.</li>
                    <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h3>3. How We Use Your Data</h3>
                <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-600 dark:text-slate-300">
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                </ul>
            </section>
        </PolicyLayout>
    );
}
