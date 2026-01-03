"use client";

import { useAdminStore } from "@/store/admin";
import { Trash2, Save, Package, Check, Download } from "lucide-react";
import { updateStock, deleteProduct, updatePrice, updateCategory } from "@/app/[storeSlug]/admin/inventory/actions";
import { useState, useEffect } from "react";

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
                <select
                    value={value}
                    onChange={(e) => {
                        handleChange(e);
                        // Auto save for select
                        onSave(e.target.value);
                        setIsDirty(false);
                    }}
                    className="bg-transparent font-bold text-gray-700 outline-none border-b border-transparent focus:border-brand-cyan hover:border-gray-200 cursor-pointer text-sm py-1"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    className="bg-transparent font-bold text-gray-900 w-20 outline-none border-b border-transparent focus:border-brand-cyan hover:border-gray-200 text-sm py-1"
                />
            )}

            {/* Save Button (only if dirty/input) */}
            {isDirty && type !== 'select' && (
                <button
                    onClick={() => { onSave(value); setIsDirty(false); }}
                    className="text-brand-cyan hover:text-cyan-700 animate-in fade-in"
                >
                    <Check size={16} />
                </button>
            )}
        </div>
    );
}


export default function InventoryTable({ products, storeId }: { products: any[], storeId: string }) {
    const { currentUser } = useAdminStore();
    const isOwner = currentUser?.role === 'Owner Access';

    // Bind actions to store
    const updateStockBound = updateStock.bind(null, storeId);
    const updateCategoryBound = updateCategory.bind(null, storeId);
    const updatePriceBound = updatePrice.bind(null, storeId);
    const deleteProductBound = deleteProduct.bind(null, storeId);

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">Live Inventory ({products.length})</h3>
                <button
                    onClick={handleExport}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                >
                    <Download size={14} className="text-gray-500" />
                    Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-3 md:p-4 text-xs font-bold text-black uppercase w-1/3">Product</th>
                            <th className="hidden md:table-cell p-4 text-xs font-bold text-black uppercase">Category</th>
                            <th className="p-3 md:p-4 text-xs font-bold text-black uppercase">Price</th>
                            <th className="p-3 md:p-4 text-xs font-bold text-black uppercase">Stock / Status</th>
                            <th className="hidden md:table-cell p-4 text-xs font-bold text-black uppercase">Date Added</th>
                            {isOwner && <th className="p-3 md:p-4 text-xs font-bold text-black uppercase text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition group">
                                <td className="p-3 md:p-4">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.image || "/placeholder.png"}
                                            alt={p.name}
                                            className="w-10 h-10 rounded-lg object-cover shadow-sm bg-gray-100"
                                        />
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 line-clamp-1">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 line-clamp-1">{p.description}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="hidden md:table-cell p-4">
                                    {isOwner ? (
                                        <form action={updateCategory} id={`cat-${p.id}`}>
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
                                        <span className="text-xs font-bold text-gray-600 bg-gray-50/50 px-2 py-1 rounded-lg">{p.category}</span>
                                    )}
                                </td>

                                {/* Price */}
                                <td className="p-3 md:p-4">
                                    {isOwner ? (
                                        <form action={updatePrice} id={`price-${p.id}`}>
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
                                        <span className="text-sm font-bold text-gray-900">₵{Number(p.priceRetail).toFixed(2)}</span>
                                    )}
                                </td>

                                {/* Stock */}
                                <td className="p-3 md:p-4">
                                    {isOwner ? (
                                        <form action={updateStock} className="flex items-center gap-2">
                                            <input type="hidden" name="id" value={p.id} />
                                            <input
                                                name="stockQty"
                                                type="number"
                                                defaultValue={p.stockQty}
                                                className={`w-16 px-2 py-1 text-xs font-bold rounded-md border text-center outline-none focus:ring-2 focus:ring-brand-cyan/20 ${p.stockQty < 5 ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"
                                                    }`}
                                            />
                                            <button title="Update Stock" className="p-1.5 hover:bg-gray-200 rounded-md text-gray-400 hover:text-gray-900 transition opacity-0 group-hover:opacity-100">
                                                <Save size={14} />
                                            </button>
                                        </form>
                                    ) : (
                                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${p.stockQty < 5 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                                            {p.stockQty} in stock
                                        </span>
                                    )}
                                </td>

                                {/* Date Added */}
                                <td className="hidden md:table-cell p-4">
                                    <span className="text-xs font-medium text-gray-500">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "-"}
                                    </span>
                                </td>

                                {/* Delete (Owner Only) */}
                                {isOwner && (
                                    <td className="p-3 md:p-4 text-right">
                                        <form action={deleteProduct}>
                                            <input type="hidden" name="id" value={p.id} />
                                            <button
                                                type="submit"
                                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-400">
                                    <Package className="mx-auto mb-3 opacity-20" size={48} />
                                    No products found in inventory.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
