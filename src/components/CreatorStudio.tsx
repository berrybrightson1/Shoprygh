"use client";

import { PlusCircle, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { createProduct } from "@/app/admin/inventory/actions";
import { compressImage } from "@/utils/imageCompression";

export default function CreatorStudio() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            try {
                const compressed = await compressImage(file);

                // Update file input with compressed file
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(compressed);
                e.target.files = dataTransfer.files;

                const url = URL.createObjectURL(compressed);
                setPreview(url);
            } catch (err) {
                console.error("Compression failed", err);
                // Fallback to original
                setPreview(URL.createObjectURL(file));
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            setIsCompressing(true);
            try {
                const compressed = await compressImage(file);

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(compressed);
                fileInputRef.current.files = dataTransfer.files;

                const url = URL.createObjectURL(compressed);
                setPreview(url);
            } catch (err) {
                console.error("Compression failed", err);
            } finally {
                setIsCompressing(false);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-brand-cyan" /> Creator Studio
            </h3>
            <form
                action={async (formData) => {
                    await createProduct(formData);
                    formRef.current?.reset();
                    setPreview(null);
                }}
                ref={formRef}
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-800 uppercase">Product Name</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="e.g. Pampers Premium Care"
                            required
                            // 1. Product Name Input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-brand-cyan/20 outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-800 uppercase">Price (₵)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            required
                            // 2. Price Input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-brand-cyan/20 outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-800 uppercase">Category</label>
                        <select
                            name="category"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 bg-white text-gray-900 font-medium"
                        >
                            <option>Diapers</option>
                            <option>Feeding</option>
                            <option>Clothing</option>
                            <option>Toys</option>
                            <option>Health</option>
                            <option>Bedding</option>
                            <option>Bundles</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-800 uppercase">Description</label>
                        <textarea
                            name="description"
                            placeholder="Product details..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 h-[50px] focus:ring-2 focus:ring-brand-cyan/20 outline-none resize-none text-gray-900 placeholder:text-gray-400 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-800 uppercase">Initial Stock</label>
                        <input
                            name="stockQty"
                            type="number"
                            placeholder="10"
                            defaultValue="10"
                            // 5. Stock Input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-brand-cyan/20 outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                        />
                    </div>
                </div>

                {/* Image Upload Area */}
                <div className="mt-4">
                    <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">Product Image</label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center group overflow-hidden ${preview ? "border-brand-cyan bg-brand-cyan/5" : "border-gray-300 hover:border-brand-cyan hover:bg-brand-cyan/5"}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={isCompressing}
                        />

                        {isCompressing ? (
                            <div className="relative h-48 w-full flex flex-col items-center justify-center gap-2">
                                <Loader2 className="animate-spin text-brand-cyan" size={32} />
                                <p className="text-xs font-bold text-brand-cyan">Compressing...</p>
                            </div>
                        ) : preview ? (
                            <div className="relative h-48 w-full flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Preview" className="h-full object-contain rounded-lg shadow-sm" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="text-white font-bold flex items-center gap-2"><ImageIcon size={18} /> Change Image</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 py-6">
                                <div className="p-3 bg-brand-cyan/10 text-brand-cyan rounded-full group-hover:scale-110 transition-transform">
                                    <PlusCircle size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-700">Click or drag image here</p>
                                <p className="text-xs text-gray-700">Supports JPG, PNG (Auto-Compressed)</p>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-8 bg-cyan-600 text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-cyan-700 hover:shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                >
                    <PlusCircle size={22} className="stroke-2" />
                    Post Item to Shop
                </button>
            </form>
        </div>
    );
}
