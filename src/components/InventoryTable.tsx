"use client";

import { useAdminStore } from "@/store/admin";
import { Trash2, Save, Package, Check, Download, AlertCircle, Search, Filter, Share2, X } from "lucide-react";
import { updateStock, deleteProduct, updatePrice, updateCategory } from "@/app/[storeSlug]/admin/inventory/actions";
import { useState, useEffect } from "react";
import ProductPoster from "./admin/ProductPoster";

// Helper to auto-submit on change or show save button
function EditableCell({
    initialValue,
    onSave,
    type = "text",
    options = [],
    prefix = ""
}: {
    initialValue: string | number,
    onSave: (val: any) => void,
    type?: "text" | "number" | "select",
    options?: string[],
    prefix?: string
}) {
    const [value, setValue] = useState(initialValue);
    const [isDirty, setIsDirty] = useState(false);

    // Sync usage when parent revalidates
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: any) => {
        setValue(e.target.value);
        setIsDirty(true);
    };

    return (
        <div className="relative group/cell flex items-center gap-1">
            <span className="text-gray-400 text-xs font-bold">{prefix}</span>
            {type === 'select' ? (
                <select title="Edit field"
                    value={value}
                    onChange={(e) => {
                        handleChange(e);
                        // Auto save for select
                        onSave(e.target.value);
                        setIsDirty(false);
                    }}
                    className="bg-transparent font-bold text-gray-700 outline-none border-b border-transparent focus:border-brand-cyan hover:border-gray-200 cursor-pointer text-sm py-1 appearance-none pr-4"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input title="Edit value" aria-label="Edit value"
                    type={type}
                    value={value}
                    onChange={handleChange}
                    className="bg-transparent font-bold text-gray-900 w-24 outline-none border-b border-transparent focus:border-brand-cyan hover:border-gray-200 text-sm py-1 transition-colors"
                />
            )}

            {/* Save Button (only if dirty/input) */}
            {isDirty && type !== 'select' && (
                <button title="Save changes"
                    onClick={() => { onSave(value); setIsDirty(false); }}
                    className="text-white bg-green-500 hover:bg-green-600 w-5 h-5 rounded-full flex items-center justify-center animate-in fade-in zoom-in ml-1"
                >
                    <Check size={12} strokeWidth={3} />
                </button>
            )}
        </div>
    );
}

export default function InventoryTable({ products, storeId, storeName, storeSlug }: { products: any[], storeId: string, storeName: string, storeSlug: string }) {
    const { currentUser } = useAdminStore();
    const isOwner = currentUser?.role === 'Owner Access';

    // Bind actions to store
    const updateStockBound = updateStock.bind(null, storeId);
    const updateCategoryBound = updateCategory.bind(null, storeId);
    const updatePriceBound = updatePrice.bind(null, storeId);
    const deleteProductBound = deleteProduct.bind(null, storeId);

    const [statusProduct, setStatusProduct] = useState<any>(null);

    const CATEGORIES = ["Diapers", "Feeding", "Clothing", "Toys", "Health", "Bedding", "Bundles"];

    const handleExport = () => {
        const headers = ["ID", "Name", "Category", "Price", "Stock", "Date Added", "Description"];
        const csvContent = [
            headers.join(","),
            ...products.map(p => [
                p.id,
                `"${p.name.replace(/"/g, '""')}"`,
                p.category,
                p.priceRetail,
                p.stockQty,
                p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
                `"${(p.description || "").replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100/60 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            {/* Table Header / Toolbar */}
            <div className="p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-black text-gray-900 text-lg tracking-tight">Live Inventory <span className="text-gray-400 font-medium ml-1">({products.length})</span></h3>
                    <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                    <div className="relative hidden sm:block">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            placeholder="Search products..."
                            className="bg-gray-50 border border-gray-200 pl-9 pr-4 py-2 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-brand-cyan focus:bg-white transition-all w-64 placeholder:text-gray-400"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        title="Filter products"
                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 p-2.5 rounded-xl transition-all flex items-center justify-center sm:hidden"
                    >
                        <Filter size={16} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                        <Download size={14} strokeWidth={3} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                            <th className="p-5 pl-8 w-[35%]">Product</th>
                            <th className="hidden md:table-cell p-5">Category</th>
                            <th className="p-5">Price</th>
                            <th className="p-5">Stock</th>
                            <th className="hidden lg:table-cell p-5">Date Added</th>
                            {isOwner && <th className="p-5 pr-8 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.id} className="group hover:bg-gray-50/80 transition-colors">
                                <td className="p-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image || "/placeholder.png"}
                                                alt={p.name}
                                                className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-gray-100 ring-2 ring-transparent group-hover:ring-brand-cyan/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-black text-sm text-gray-900 line-clamp-1 mb-0.5 group-hover:text-brand-purple transition-colors">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 font-bold line-clamp-1 flex items-center gap-1.5 opacity-70">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-cyan transition-colors" /> {p.description || "No description"}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="hidden md:table-cell p-5">
                                    {isOwner ? (
                                        <form action={updateCategoryBound} id={`cat-${p.id}`} className="inline-block">
                                            <input type="hidden" name="id" value={p.id} />
                                            <input type="hidden" name="category" id={`cat-input-${p.id}`} />
                                            <EditableCell
                                                initialValue={p.category}
                                                type="select"
                                                options={CATEGORIES}
                                                onSave={(val) => {
                                                    // Programmatically submit form
                                                    const input = document.getElementById(`cat-input-${p.id}`) as HTMLInputElement;
                                                    const form = document.getElementById(`cat-${p.id}`) as HTMLFormElement;
                                                    if (input && form) {
                                                        input.value = val;
                                                        form.requestSubmit();
                                                    }
                                                }}
                                            />
                                        </form>
                                    ) : (
                                        <span className="text-[11px] font-black text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200/60 uppercase tracking-wide">{p.category}</span>
                                    )}
                                </td>

                                {/* Price */}
                                <td className="p-5">
                                    {isOwner ? (
                                        <form action={updatePriceBound} id={`price-${p.id}`}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <input type="hidden" name="price" id={`price-input-${p.id}`} />
                                            <EditableCell
                                                initialValue={Number(p.priceRetail)}
                                                type="number"
                                                prefix="₵"
                                                onSave={(val) => {
                                                    const input = document.getElementById(`price-input-${p.id}`) as HTMLInputElement;
                                                    const form = document.getElementById(`price-${p.id}`) as HTMLFormElement;
                                                    if (input && form) {
                                                        input.value = val;
                                                        form.requestSubmit();
                                                    }
                                                }}
                                            />
                                        </form>
                                    ) : (
                                        <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl">₵{Number(p.priceRetail).toFixed(2)}</span>
                                    )}
                                </td>

                                {/* Stock */}
                                <td className="p-5">
                                    {isOwner ? (
                                        <form action={updateStockBound} className="flex items-center gap-2">
                                            <input type="hidden" name="id" value={p.id} />
                                            <input
                                                title="Stock Quantity"
                                                aria-label="Stock Quantity"
                                                name="stockQty"
                                                type="number"
                                                defaultValue={p.stockQty}
                                                className={`w-16 px-2 py-1.5 text-xs font-bold rounded-lg border text-center outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all ${p.stockQty < 5 ? "border-red-200 bg-red-50 text-red-700 placeholder:text-red-300" : "border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                                                    }`}
                                            />
                                            <button title="Update Stock" className="p-1.5 hover:bg-gray-900 hover:text-white rounded-lg text-gray-400 transition-all opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100">
                                                <Save size={14} />
                                            </button>
                                        </form>
                                    ) : (
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${p.stockQty < 5 ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"}`}>
                                            <span className={`w-2 h-2 rounded-full ${p.stockQty < 5 ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                                            <span className="text-[11px] font-black uppercase tracking-wide">
                                                {p.stockQty < 5 ? "Low Stock" : `${p.stockQty} Units`}
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Date Added */}
                                <td className="hidden lg:table-cell p-5">
                                    <span className="text-xs font-bold text-gray-500">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                                    </span>
                                </td>

                                {/* Delete (Owner Only) */}
                                {isOwner && (
                                    <td className="p-5 pr-8 text-right flex items-center justify-end gap-2">
                                        <button
                                            title="Generate Status"
                                            onClick={() => setStatusProduct({
                                                id: p.id,
                                                name: p.name,
                                                price: Number(p.priceRetail),
                                                image: p.image,
                                                storeName: storeName,
                                                storeSlug: storeSlug
                                            })}
                                            className="p-2.5 bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-brand-orange rounded-xl transition-all"
                                        >
                                            <Share2 size={16} />
                                        </button>

                                        <form action={deleteProductBound}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <button
                                                type="submit"
                                                className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all hover:scale-110 active:scale-90"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                                            <Package className="text-gray-500" size={48} />
                                        </div>
                                        <p className="font-black text-gray-900 text-lg">No products found</p>
                                        <p className="text-gray-500 font-bold mt-1">Add items to your inventory to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Maker Modal - Professional Redesign */}
            {statusProduct && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[28px] shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={() => setStatusProduct(null)}
                            className="absolute top-4 right-4 p-2.5 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>

                        {/* Top Section - Poster Preview Mockup */}
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative">
                            {/* Phone Frame Mockup */}
                            <div className="mx-auto w-40 bg-black rounded-[20px] p-1.5 shadow-2xl shadow-black/50">
                                <div className="bg-white rounded-[16px] overflow-hidden aspect-[9/16]">
                                    {/* Mini Poster Preview */}
                                    <div className="h-[55%] bg-gray-100 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={statusProduct.image || "/placeholder.png"}
                                            alt={statusProduct.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black text-white text-[6px] px-2 py-0.5 rounded-full font-bold uppercase">
                                            {statusProduct.storeName}
                                        </div>
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[5px] px-1.5 py-0.5 rounded-full font-bold">
                                            ✨ NEW
                                        </div>
                                    </div>
                                    <div className="h-[25%] flex flex-col items-center justify-center px-2 bg-gray-50">
                                        <p className="text-[7px] font-bold text-gray-900 text-center truncate w-full">{statusProduct.name}</p>
                                        <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full mt-1">
                                            ₵{statusProduct.price.toFixed(0)}
                                        </div>
                                    </div>
                                    <div className="h-[20%] bg-white flex items-center justify-center border-t border-gray-100">
                                        <div className="w-6 h-6 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Labels */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Share2 size={14} className="text-white" />
                                </div>
                            </div>
                            <p className="text-center text-white/60 text-xs font-medium mt-4">Preview</p>
                        </div>

                        {/* Bottom Section - Info & Action */}
                        <div className="p-6">
                            {/* Title */}
                            <h2 className="text-xl font-black text-gray-900 text-center mb-1">Create Status Image</h2>
                            <p className="text-sm text-gray-500 text-center mb-5">Ready to share on WhatsApp & Instagram Stories</p>

                            {/* Product Summary Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 flex items-center gap-4 mb-5 border border-gray-200/50">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border-2 border-white shadow-md shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={statusProduct.image || "/placeholder.png"}
                                        alt={statusProduct.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate text-sm">{statusProduct.name}</h3>
                                    <p className="text-xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                                        ₵{statusProduct.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Features - Horizontal */}
                            <div className="flex items-center justify-center gap-4 mb-5 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                                    QR Code
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                                    9:16 Format
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                                    HD Quality
                                </span>
                            </div>

                            {/* Download Button */}
                            <ProductPoster product={statusProduct} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
