"use client";

import { useState } from "react";
import { Upload, Download, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { bulkImportProducts, type BulkImportResult } from "@/app/[storeSlug]/admin/catalog/actions";
import { toast } from "sonner";

interface BulkImportModalProps {
    storeId: string;
    onClose: () => void;
}

export default function BulkImportModal({ storeId, onClose }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<BulkImportResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error("Please select a CSV file");
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setIsProcessing(true);

        try {
            // Parse CSV
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const csvData = results.data as any[];

                        if (csvData.length === 0) {
                            toast.error("CSV file is empty");
                            setIsProcessing(false);
                            return;
                        }

                        // Call server action
                        const importResult = await bulkImportProducts(storeId, csvData);
                        setResult(importResult);

                        if (importResult.imported > 0) {
                            toast.success(`Successfully imported ${importResult.imported} products!`);
                        }

                        if (importResult.failed > 0) {
                            toast.warning(`${importResult.failed} products failed to import`);
                        }
                    } catch (error: any) {
                        toast.error(error.message || "Failed to import products");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                error: (error) => {
                    toast.error(`CSV parsing error: ${error.message}`);
                    setIsProcessing(false);
                }
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to process file");
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const template = `name,priceRetail,stockQty,category,description,priceWholesale,sku
Baby Wipes,25.50,100,Baby Care,Soft baby wipes,20.00,BW001
Diapers Size 3,45.00,50,Baby Care,Premium diapers,38.00,DS003
Baby Lotion,18.75,75,Skincare,Gentle baby lotion,15.00,BL001`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'product_import_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all z-20 active:scale-95"
                >
                    <X size={20} className="text-gray-900" />
                </button>

                {/* Header */}
                <div className="p-10 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center border border-brand-cyan/20">
                            <Upload size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Import</h2>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-0.5">CSV Product Upload</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-10">
                    {!result ? (
                        <>
                            {/* Download Template */}
                            <div className="mb-8">
                                <button
                                    onClick={downloadTemplate}
                                    className="w-full bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-brand-cyan/30 rounded-2xl p-6 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Download size={20} className="text-gray-400 group-hover:text-brand-cyan transition-colors" />
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 uppercase tracking-widest">
                                        Download CSV Template
                                    </span>
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="mb-8">
                                <label className="block mb-3">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select CSV File</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        title="Upload CSV file"
                                        className="w-full bg-white border-2 border-gray-200 hover:border-brand-cyan/50 rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-brand-cyan/10 flex items-center justify-center transition-colors">
                                            <Upload size={28} className="text-gray-300 group-hover:text-brand-cyan transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-gray-900 mb-1">
                                                {file ? file.name : "Click to upload CSV file"}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                                                {file ? `${(file.size / 1024).toFixed(2)} KB` : "Max 5MB"}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3">CSV Format Requirements</h3>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span><strong>Required:</strong> name, priceRetail, stockQty</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span><strong>Optional:</strong> category, description, priceWholesale, sku</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>Price must be positive number</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>Stock must be non-negative integer</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Import Button */}
                            <button
                                onClick={handleImport}
                                disabled={!file || isProcessing}
                                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Import Products
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        /* Results */
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                                    <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
                                    <div className="text-3xl font-black text-emerald-900 mb-1">{result.imported}</div>
                                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Imported</div>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                                    <AlertCircle size={32} className="text-red-600 mx-auto mb-3" />
                                    <div className="text-3xl font-black text-red-900 mb-1">{result.failed}</div>
                                    <div className="text-xs font-bold text-red-700 uppercase tracking-widest">Failed</div>
                                </div>
                            </div>

                            {/* Errors */}
                            {result.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 max-h-64 overflow-y-auto">
                                    <h3 className="text-xs font-black text-red-900 uppercase tracking-widest mb-4">Import Errors</h3>
                                    <div className="space-y-3">
                                        {result.errors.map((error, idx) => (
                                            <div key={idx} className="bg-white rounded-xl p-4 border border-red-100">
                                                <div className="text-xs font-bold text-red-700 mb-1">Row {error.row}</div>
                                                <div className="text-sm text-red-900">{error.error}</div>
                                                {error.data && (
                                                    <div className="text-xs text-gray-500 mt-2 font-mono">
                                                        {JSON.stringify(error.data, null, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-full bg-black hover:bg-gray-800 text-white px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
