export default function AdminLoading() {
    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div className="space-y-3">
                    <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-64 bg-gray-200 rounded-2xl"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                </div>
            </div>

            {/* Dashboard Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-40 flex flex-col justify-between">
                        <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                            <div className="h-3 w-32 bg-gray-100 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-white rounded-3xl border border-gray-100"></div>
                <div className="h-96 bg-white rounded-3xl border border-gray-100"></div>
            </div>
        </div>
    );
}
