import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-8">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-black text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Shopry ("the Platform"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Service Description</h2>
                        <p>
                            Shopry provides a multi-tenant SaaS platform that enables businesses to create and manage online stores.
                            We offer inventory management, order processing, and customer relationship tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Account Registration</h2>
                        <p>You agree to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate and complete information during registration</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
                        <p>You may NOT use the Platform to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sell illegal, counterfeit, or prohibited goods</li>
                            <li>Engage in fraudulent or deceptive practices</li>
                            <li>Violate intellectual property rights</li>
                            <li>Harass, abuse, or harm others</li>
                            <li>Distribute malware or spam</li>
                            <li>Interfere with the Platform's security or functionality</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Subscription & Payment</h2>
                        <p>
                            Subscription fees are billed monthly in advance based on your selected plan (Hustler, Pro, or Wholesaler).
                            Fees are non-refundable except as required by law. We reserve the right to modify pricing with 30 days' notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Content Ownership</h2>
                        <p>
                            You retain all rights to content you upload (product images, descriptions, etc.).
                            By uploading content, you grant Shopry a license to use, display, and distribute your content
                            solely for providing our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Account Suspension</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity,
                            or pose a security risk. We will provide notice when possible, but may act immediately in severe cases.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
                        <p>
                            Shopry is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages
                            arising from your use of the Platform. Our total liability shall not exceed the fees paid in the last 12 months.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of Ghana. Any disputes shall be resolved in the courts of Accra, Ghana.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                        <p>
                            For questions about these Terms, please contact us at:{" "}
                            <a href="mailto:support@shopry.app" className="text-brand-orange hover:underline">
                                support@shopry.app
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
