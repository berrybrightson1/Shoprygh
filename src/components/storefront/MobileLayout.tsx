export default function MobileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 lg:bg-white flex justify-center">
            <div className="w-full max-w-md lg:max-w-none lg:w-full bg-white min-h-screen shadow-2xl lg:shadow-none relative">
                {children}
            </div>
        </div>
    );
}
