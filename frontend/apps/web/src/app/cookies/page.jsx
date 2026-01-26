"use client";

import React from "react";
import PolicyLayout from "@/components/layout/PolicyLayout";

export default function CookiePolicy() {
    return (
        <PolicyLayout title="Cookie Policy" lastUpdated="January 26, 2026" type="cookies">
            <section className="mb-8">
                <h3>1. What Are Cookies</h3>
                <p>
                    As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
                </p>
            </section>

            <section className="mb-8">
                <h3>2. How We Use Cookies</h3>
                <p>
                    We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                </p>
            </section>

            <section className="mb-8">
                <h3>3. Refusing Cookies</h3>
                <p>
                    You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.
                </p>
            </section>
        </PolicyLayout>
    );
}
