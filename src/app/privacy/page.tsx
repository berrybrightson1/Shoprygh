import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-black text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p>We collect the following types of information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Name, email address, phone number, store name</li>
                            <li><strong>Business Data:</strong> Product listings, inventory, orders, customer information</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                            <li><strong>Payment Information:</strong> Payment method details (processed securely via Paystack)</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide and maintain our services</li>
                            <li>Process transactions and manage subscriptions</li>
                            <li>Send important updates and notifications</li>
                            <li>Improve our platform and develop new features</li>
                            <li>Detect and prevent fraud or abuse</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Sharing</h2>
                        <p>We do NOT sell your personal data. We may share information with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Providers:</strong> Payment processors (Paystack), hosting providers (Vercel, Supabase)</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data, including encryption,
                            secure connections (HTTPS), and regular security audits. However, no method is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
                        <p>
                            We retain your data as long as your account is active or as needed to provide services.
                            When you delete your account, we will delete or anonymize your data within 30 days,
                            except where required by law to retain it longer.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access and download your data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data</li>
                            <li>Object to data processing</li>
                            <li>Data portability (export your data)</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, contact us at{" "}
                            <a href="mailto:privacy@shopry.app" className="text-brand-orange hover:underline">
                                privacy@shopry.app
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
                        <p>
                            We use essential cookies for authentication and session management. We do not use tracking cookies
                            for advertising. You can disable cookies in your browser, but this may affect functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
                        <p>
                            Our services are not directed to individuals under 18. We do not knowingly collect data from children.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. We will notify you of significant changes via email
                            or through the Platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                        <p>
                            For privacy questions or concerns, email:{" "}
                            <a href="mailto:privacy@shopry.app" className="text-brand-orange hover:underline">
                                privacy@shopry.app
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
