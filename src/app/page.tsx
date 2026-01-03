import Link from "next/link";
import { ArrowRight, Store, ShieldCheck, Zap } from "lucide-react";

export default function PlatformLanding() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">S</div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Shopry</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-black transition">Log In</Link>
                        <Link href="/signup" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition hover:shadow-lg hover:shadow-black/20">
                            Start Selling
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Enterprise Ready</h3>
            <p className="text-sm text-gray-500">Role-based access, audit logs, and wholesale pricing tiers.</p>
        </div>
                    </div >
                </div >
            </main >

        <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400">
            &copy; 2026 Anaya Platforms. All rights reserved.
        </footer>
        </div >
    );
}
