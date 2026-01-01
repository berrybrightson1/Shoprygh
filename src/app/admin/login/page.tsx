import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { login } from './actions';

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
        redirect('/admin/inventory');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-cyan to-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                    <p className="text-sm text-gray-500 mt-2">Sign in to manage your store.</p>
                </div>

                <form action={login} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@anayakids.com"
                            className="w-full bg-white text-black font-bold border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-cyan/20 transition placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-white text-black font-bold border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-cyan/20 transition placeholder:text-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition shadow-lg mt-4"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
