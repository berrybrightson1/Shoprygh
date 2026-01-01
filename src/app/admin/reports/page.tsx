import { BarChart } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart size={32} className="text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-500 mt-2">Sales data and performance metrics will appear here.</p>
        </div>
    );
}
