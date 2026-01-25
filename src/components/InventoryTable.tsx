"use client";

import { useAdminStore } from "@/store/admin";
import { Trash2, Save, Package, Check, Download, AlertCircle, Search, Filter, Share2, X, Upload } from "lucide-react";
import { updateStock, deleteProduct, updatePrice, updateCategory } from "@/app/[storeSlug]/admin/inventory/actions";
import { useState, useEffect } from "react";
import ProductPoster from "./admin/ProductPoster";
import BrandedSelect from "./shared/BrandedSelect";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import BulkImportModal from "./admin/BulkImportModal";

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
            <span className="text-gray-400 text-xs font-medium">{prefix}</span>
            {type === 'select' ? (
                <BrandedSelect
                    options={options}
                    value={String(value)}
                    onChange={(val) => {
                        setValue(val);
                        onSave(val);
                    }}
                    className="w-40"
                />
            ) : (
                <input title="Edit value" aria-label="Edit value"
                    type={type}
                    value={value}
                    onChange={handleChange}
                    className="bg-transparent font-medium text-gray-900 w-full outline-none border-b-2 border-transparent focus:border-brand-cyan/30 hover:border-gray-100/50 text-base md:text-sm py-1.5 transition-all tabular-nums"
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

export default function InventoryTable({
    products,
    storeId,
    storeName,
    storeSlug,
    pagination
}: {
    products: any[],
    storeId: string,
    storeName: string,
    storeSlug: string,
    pagination?: {
        currentPage: number,
        totalPages: number,
        totalItems: number
    }
}) {
    const { currentUser } = useAdminStore();
    const isOwner = currentUser?.role === 'Owner Access';
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    // Bind actions to store
    const updateStockBound = updateStock.bind(null, storeId);
    const updateCategoryBound = updateCategory.bind(null, storeId);
    const updatePriceBound = updatePrice.bind(null, storeId);
    const deleteProductBound = deleteProduct.bind(null, storeId);

    const [statusProduct, setStatusProduct] = useState<any>(null);
    const [showImportModal, setShowImportModal] = useState(false);

    const CATEGORIES = [
        "Diapers", "Feeding", "Clothing", "Toys", "Health", "Bedding",
        "Electronics", "Beauty", "Home", "Fashion", "Bundles", "General"
    ];

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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
            {/* Table Header / Toolbar */}
            <div className="p-8 lg:p-10 border-b border-gray-50 bg-white flex flex-col xl:flex-row justify-between items-center gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-8 w-full xl:w-auto">
                    <div className="shrink-0">
                        <h3 className="font-medium text-gray-900 text-2xl tracking-tight flex items-center gap-3">
                            Catalog
                            <span className="text-[10px] font-medium text-brand-cyan bg-cyan-50/50 px-2 py-1 rounded-lg uppercase tracking-widest border border-cyan-100/50">{products.length} Assets</span>
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-widest leading-none">Live inventory orchestrator</p>
                    </div>

                    <div className="h-10 w-px bg-gray-100 hidden sm:block mx-2" />

                    <div className="relative w-full sm:w-[380px] group/search">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-brand-cyan transition-colors" />
                        <input
                            placeholder="Search catalog ID, name or SKU..."
                            className="bg-gray-50/50 border border-gray-200/50 pl-12 pr-4 py-4 rounded-2xl text-base md:text-[13px] font-medium text-gray-900 outline-none focus:border-brand-cyan/30 focus:bg-white focus:ring-4 focus:ring-brand-cyan/5 transition-all w-full placeholder:text-gray-300 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <button
                        title="Filter products"
                        className="bg-white hover:bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900 p-4 rounded-2xl transition-all flex items-center justify-center shadow-sm active:scale-95 group"
                    >
                        <Filter size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-brand-purple hover:bg-purple-700 text-white px-8 py-4 rounded-2xl text-[11px] font-medium uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-3 flex-1 xl:flex-none justify-center active:scale-95"
                        >
                            <Upload size={18} strokeWidth={2} />
                            Import CSV
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl text-[11px] font-medium uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 flex-1 xl:flex-none justify-center active:scale-95"
                    >
                        <Download size={18} strokeWidth={2} />
                        Export Log
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/30 border-b border-gray-100 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">
                            <th className="p-6 pl-10 w-[35%]">Product Information</th>
                            <th className="hidden md:table-cell p-6">Category</th>
                            <th className="p-6">Unit Price</th>
                            <th className="p-6">Stock Health</th>
                            <th className="hidden lg:table-cell p-6">Identity</th>
                            {isOwner && <th className="p-6 pr-10 text-right">Operations</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.map((p) => (
                            <tr key={p.id} className="group hover:bg-gray-50/30 transition-colors cursor-default">
                                <td className="p-6 pl-10">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image || "/placeholder.png"}
                                                alt={p.name}
                                                className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-100"
                                            />
                                            {p.stockQty < 5 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[15px] text-gray-900 group-hover:text-brand-cyan transition-colors mb-0.5">{p.name}</div>
                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest flex items-center gap-2">
                                                <span>SN: {p.id.slice(-6).toUpperCase()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                <span className="line-clamp-1 max-w-[150px]">{p.description || "NO METADATA"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="hidden md:table-cell p-6">
                                    {isOwner ? (
                                        <form action={updateCategoryBound} id={`cat-${p.id}`} className="inline-block">
                                            <input type="hidden" name="id" value={p.id} />
                                            <input type="hidden" name="category" id={`cat-input-${p.id}`} />
                                            <EditableCell
                                                initialValue={p.category}
                                                type="select"
                                                options={CATEGORIES}
                                                onSave={(val) => {
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
                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100/50">{p.category}</span>
                                    )}
                                </td>

                                {/* Price */}
                                <td className="p-6">
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
                                        <span className="text-base font-medium text-gray-900 tracking-tight">₵{Number(p.priceRetail).toFixed(2)}</span>
                                    )}
                                </td>

                                {/* Stock */}
                                <td className="p-6">
                                    {isOwner ? (
                                        <form action={updateStockBound} className="flex items-center gap-3">
                                            <input type="hidden" name="id" value={p.id} />
                                            <input
                                                title="Stock Quantity"
                                                aria-label="Stock Quantity"
                                                name="stockQty"
                                                type="number"
                                                defaultValue={p.stockQty}
                                                className={`w-20 px-3 py-2 text-xs font-medium rounded-xl border text-center outline-none focus:ring-4 focus:ring-brand-cyan/10 transition-all ${p.stockQty < 5 ? "border-red-100 bg-red-50 text-red-700" : "border-gray-100/50 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-brand-cyan/30"
                                                    }`}
                                            />
                                            <button title="Update Stock" className="p-2.5 bg-gray-50 hover:bg-black hover:text-white rounded-xl text-gray-300 transition-all opacity-0 group-hover:opacity-100 active:scale-95 shadow-sm">
                                                <Save size={16} strokeWidth={2.5} />
                                            </button>
                                        </form>
                                    ) : (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${p.stockQty < 5 ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${p.stockQty < 5 ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                                            <span className="text-[10px] font-medium uppercase tracking-[0.1em]">
                                                {p.stockQty < 5 ? "Low Supply" : `${p.stockQty} Available`}
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Date Added */}
                                <td className="hidden lg:table-cell p-6">
                                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) : "-"}
                                    </span>
                                </td>

                                {/* Delete (Owner Only) */}
                                {isOwner && (
                                    <td className="p-6 pr-10 text-right">
                                        <div className="flex items-center justify-end gap-3">
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
                                                className="p-3 bg-gray-50 hover:bg-white hover:shadow-xl hover:shadow-orange-100 text-gray-400 hover:text-brand-orange rounded-2xl transition-all active:scale-95 border border-transparent hover:border-orange-50"
                                            >
                                                <Share2 size={18} strokeWidth={2.5} />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    toast("Are you sure?", {
                                                        description: "This action cannot be undone.",
                                                        action: {
                                                            label: "Delete",
                                                            onClick: () => {
                                                                const formData = new FormData();
                                                                formData.append("id", p.id);
                                                                toast.promise(deleteProductBound(formData), {
                                                                    loading: `Deleting ${p.name}...`,
                                                                    success: `${p.name} has been removed`,
                                                                    error: "Failed to remove product"
                                                                });
                                                            }
                                                        },
                                                        cancel: {
                                                            label: "Cancel",
                                                            onClick: () => { }
                                                        }
                                                    });
                                                }}
                                                className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all active:scale-95"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
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
                                        <p className="font-medium text-gray-900 text-lg">No products found</p>
                                        <p className="text-gray-500 font-normal mt-1">Add items to your inventory to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-400 disabled:opacity-50 hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-400 disabled:opacity-50 hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Status Maker Modal - Professional Redesign */}
            {
                statusProduct && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
                        <div className="bg-white rounded-[48px] shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 overflow-hidden border border-white/20">
                            {/* Close Button */}
                            <button
                                onClick={() => setStatusProduct(null)}
                                title="Close"
                                aria-label="Close"
                                className="absolute top-8 right-8 p-3 bg-black/5 hover:bg-black/10 rounded-full transition-all z-20 active:scale-95"
                            >
                                <X size={20} className="text-gray-900" />
                            </button>

                            {/* Top Section - Poster Preview Mockup */}
                            <div className="bg-[#0f0f0f] p-10 relative overflow-hidden">
                                {/* Decorative Background Elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                                {/* Phone Frame Mockup */}
                                <div className="mx-auto w-48 bg-black rounded-[40px] p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10">
                                    <div className="bg-white rounded-[32px] overflow-hidden aspect-[9/16] relative">
                                        {/* Mini Poster Preview */}
                                        <div className="h-[65%] relative group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={statusProduct.image || "/placeholder.png"}
                                                alt={statusProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-4 left-4 flex flex-col gap-1">
                                                <div className="bg-black/80 backdrop-blur-md text-white text-[7px] px-2.5 py-1 rounded-full font-medium uppercase tracking-widest border border-white/10">
                                                    {statusProduct.storeName}
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[8px] px-3 py-1 rounded-full font-medium shadow-lg">
                                                NEW ARRIVAL
                                            </div>
                                        </div>
                                        <div className="h-[35%] flex flex-col items-center justify-center px-4 bg-white relative">
                                            <div className="w-8 h-1 bg-gray-100 rounded-full absolute top-2" />
                                            <p className="text-[10px] font-medium text-gray-900 text-center truncate w-full mb-1 uppercase tracking-tight">{statusProduct.name}</p>
                                            <div className="text-brand-orange text-xl font-medium tabular-nums">
                                                ₵{statusProduct.price.toFixed(0)}
                                            </div>
                                            <div className="mt-2 flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-brand-cyan/30" />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-white/40 text-[10px] font-medium uppercase tracking-[0.3em] mt-8">Studio Preview</p>
                            </div>

                            {/* Bottom Section - Info & Action */}
                            <div className="p-10">
                                {/* Title */}
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-medium text-gray-900 tracking-tight mb-2">Social Orchestrator</h2>
                                    <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Generate high-fidelity marketing assets</p>
                                </div>

                                {/* Features - Horizontal */}
                                <div className="grid grid-cols-3 gap-4 mb-10">
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/50">
                                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Ratio</div>
                                        <div className="text-sm font-medium text-gray-900">9:16</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/50">
                                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Quality</div>
                                        <div className="text-sm font-medium text-gray-900">4K HD</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/50">
                                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Format</div>
                                        <div className="text-sm font-medium text-gray-900">PNG</div>
                                    </div>
                                </div>

                                {/* Download Button */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-[28px] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    <ProductPoster product={statusProduct} />
                                </div>

                                <p className="text-center text-[10px] text-gray-400 font-medium mt-6 uppercase tracking-widest opacity-60">Ready for WhatsApp & Instagram Stories</p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Import Modal */}
            {showImportModal && (
                <BulkImportModal
                    storeId={storeId}
                    onClose={() => setShowImportModal(false)}
                />
            )}
        </div >
    );
}
