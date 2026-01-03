import Link from "next/link";
import { Lock } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 text-center bg-brand-cyan/5">
                    <div className="mx-auto w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 shadow-lg rotate-3">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-2">Enter your credentials to access your store.</p>
                </div>

                <div className="p-8">
                    <form action={login} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 font-bold text-gray-900 placeholder:font-normal"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 font-bold text-gray-900 placeholder:font-normal"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg mt-4 active:scale-95 duration-200"
                        >
                            Find My Store & Login
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        Don't have a store yet?{" "}
                        <Link href="/signup" className="text-brand-cyan font-bold hover:underline">
                            Create one here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
