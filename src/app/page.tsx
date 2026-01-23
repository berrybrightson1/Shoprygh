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

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-20 lg:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Powering Ghanaian Businesses
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 leading-tight">
                    Launch your dream <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-pink-600">online store</span> today.
                </h1>

                <p className="text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl mb-8 md:mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 px-2">
                    Shopry gives you everything you need to sell online. Inventory, payments, staff management, and delivery—all in one simple dashboard.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-4 sm:px-0">
                    <Link href="/signup" className="w-full sm:w-auto bg-black text-white px-6 py-3.5 md:px-5 md:py-4 rounded-full text-base md:text-lg font-bold hover:bg-gray-800 transition hover:scale-105 active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                        Get Started for Free
                        <ArrowRight size={18} />
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto px-6 py-3.5 md:px-5 md:py-4 rounded-full text-base md:text-lg font-bold text-gray-600 hover:bg-gray-50 transition border border-gray-200 hover:border-gray-300 flex items-center justify-center">
                        View Demo
                    </Link>
                </div>

                {/* Social Proof / Trust */}
                <div className="mt-12 md:mt-16 pt-8 border-t border-gray-100 w-full max-w-md animate-in fade-in zoom-in duration-1000 delay-300">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trusted by modern brands</p>
                    <div className="flex justify-center gap-6 opacity-40 grayscale">
                        {/* Placeholders for logos */}
                        <div className="h-6 w-20 bg-gray-900/20 rounded-md"></div>
                        <div className="h-6 w-20 bg-gray-900/20 rounded-md"></div>
                        <div className="h-6 w-20 bg-gray-900/20 rounded-md"></div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-400">
                &copy; 2026 Anaya Platforms. All rights reserved.
            </footer>
        </div >
    );
}
