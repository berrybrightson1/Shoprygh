import Link from "next/link";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
            {/* Main App Container - Full width mobile-first web app */}
            <main className="w-full max-w-[480px] bg-white min-h-screen shadow-sm relative flex flex-col">
                {children}
            </main>
        </div>
    );
}
