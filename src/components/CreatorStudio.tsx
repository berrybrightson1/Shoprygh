"use client";

import { Plus, X, Image as ImageIcon, Sparkles, Smartphone, Box, Trash2, Upload, Tag, ChevronDown, Wand2, Package, Layers, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { compressImage } from "@/utils/imageCompression";
import { toast } from "sonner";

interface Variant {
    id: string;
    name: string;
    price: string;
    stockQty: string;
    sku: string;
}

const CATEGORIES = [
    "Diapers", "Feeding", "Clothing", "Toys", "Health", "Bedding",
    "Electronics", "Beauty", "Home", "Fashion", "Bundles", "General"
];

// --- Draggable Pill Component ---
function DraggablePill({ viewMode, setViewMode }: { viewMode: 'edit' | 'preview', setViewMode: (m: 'edit' | 'preview') => void }) {
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number, y: number } | null>(null);
    const initialPos = useRef<{ x: number, y: number } | null>(null);
    const hasMoved = useRef(false);

    // Set initial position to bottom center on mount (Client Only)
    useEffect(() => {
        setPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight - 100 });
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        // Only left click or touch
        if (e.button !== 0) return;

        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        hasMoved.current = false;

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialPos.current = { x: rect.left, y: rect.top };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !dragStart.current || !initialPos.current) return;

        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;

        setPosition({
            x: initialPos.current.x + dx,
            y: initialPos.current.y + dy
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        // Manual Click Detection (since we capture pointer events)
        if (!hasMoved.current) {
            // Check what element is under the pointer
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const btn = target?.closest('button');
            if (btn) {
                const mode = btn.getAttribute('data-mode') as 'edit' | 'preview' | null;
                if (mode) setViewMode(mode);
            }
        }
    };

    // If no position yet (SSR), return null or default
    if (!position) return null;

    return (
        <div
            className="xl:hidden fixed z-[100] touch-none cursor-move animate-in zoom-in duration-300"
            style={{ left: position.x, top: position.y }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="flex items-center gap-1 p-1.5 bg-gray-900/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 rounded-full active:scale-95 transition-transform">
                <button
                    type="button"
                    data-mode="edit"
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 select-none ${viewMode === 'edit'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-400'
                        }`}
                >
                    <Wand2 size={14} />
                    Editor
                </button>
                <div className="w-px h-4 bg-white/20" />
                <button
                    type="button"
                    data-mode="preview"
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 select-none ${viewMode === 'preview'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-400'
                        }`}
                >
                    <Smartphone size={14} />
                    Preview
                </button>
            </div>
            {/* Handle/Grip hint */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-300/50 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
        </div>
    );
}

export default function CreatorStudio({
    createAction,
    storeTier = 'HUSTLER'
}: {
    createAction: (formData: FormData) => Promise<void>,
    storeTier?: string
}) {
    // --- State ---
    const borderClass = "border-gray-200 focus:border-brand-purple hover:border-gray-300";
    const inputClass = "w-full bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-purple-500 rounded-2xl px-4 py-3.5 font-bold text-gray-900 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-4 focus:ring-purple-500/10";

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Diapers");
    const [description, setDescription] = useState("");

    // Images
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successParams, setSuccessParams] = useState<boolean>(false);

    // File Refs
    const mainFileRef = useRef<File | null>(null);
    const galleryFilesRef = useRef<File[]>([]);

    // Tags & Variants
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [variants, setVariants] = useState<Variant[]>([]);

    const formRef = useRef<HTMLFormElement>(null);

    // --- Handlers ---

    const handleMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsCompressing(true);
            try {
                const compressed = await compressImage(file);
                mainFileRef.current = compressed;
                setMainImage(URL.createObjectURL(compressed));
            } catch (err) {
                console.error(err);
                mainFileRef.current = file;
                setMainImage(URL.createObjectURL(file));
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsCompressing(true);
        const newUrls: string[] = [];
        const newFiles: File[] = [];

        for (const file of files) {
            try {
                const compressed = await compressImage(file);
                newFiles.push(compressed);
                newUrls.push(URL.createObjectURL(compressed));
            } catch (err) {
                newFiles.push(file);
                newUrls.push(URL.createObjectURL(file));
            }
        }

        galleryFilesRef.current = [...galleryFilesRef.current, ...newFiles];
        setGallery(prev => [...prev, ...newUrls]);
        setIsCompressing(false);
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const addVariant = () => {
        setVariants([...variants, { id: crypto.randomUUID(), name: "", price: "", stockQty: "0", sku: "" }]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const updateVariant = (id: string, field: keyof Variant, value: string) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    // --- AI Logic ---
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    const generateDescription = async () => {
        if (!name) {
            toast.error("Please enter a product name first!");
            return;
        }

        setIsGeneratingAI(true);
        try {
            const { generateProductDescription } = await import("@/app/actions/ai");
            const result = await generateProductDescription(name, tags);

            if (result.success && result.description) {
                setDescription(result.description);
                toast.success("AI description generated!");
            } else {
                toast.error(result.error || "Failed to generate description");
            }
        } catch (error) {
            console.error("AI generation error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsGeneratingAI(false);
        }
    };


    // --- Render ---

    return (
        <>
            {/* Mobile Toggle (Edit vs Preview) */}
            {/* Floating Mobile Toggle (Assistive Touch) */}
            <DraggablePill viewMode={viewMode} setViewMode={setViewMode} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-20 pb-24 animate-in fade-in duration-500">
                {/* LEFT: Editor Form (7/12 cols) */}
                <div className={`xl:col-span-7 space-y-6 ${viewMode === 'preview' ? 'hidden xl:block' : ''}`}>
                    <div className="bg-white p-6 lg:p-8 rounded-[32px] shadow-2xl shadow-gray-200/50 border border-white/60 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                                    <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                                        <Sparkles size={20} className="fill-purple-200" />
                                    </span>
                                    Creator Studio
                                </h2>
                                <p className="text-gray-500 font-bold ml-1 mt-1 text-sm md:text-base">Craft your next bestseller.</p>
                            </div>
                            <div className="flex gap-2 self-start md:self-auto">
                                <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    New Draft
                                </span>
                            </div>
                        </div>


                        <form
                            ref={formRef}
                            action={async (formData) => {
                                if (isSubmitting) return;
                                setIsSubmitting(true);
                                try {
                                    if (mainFileRef.current) formData.set("image", mainFileRef.current);
                                    galleryFilesRef.current.forEach(f => formData.append("gallery", f));
                                    formData.set("tags", JSON.stringify(tags));
                                    formData.set("variants", JSON.stringify(variants));

                                    await createAction(formData);

                                    // Success State
                                    setSuccessParams(true);
                                    toast.success("Product published successfully!");

                                    // Reset after delay
                                    setTimeout(() => {
                                        formRef.current?.reset();
                                        setMainImage(null);
                                        setGallery([]);
                                        setTags([]);
                                        setVariants([]);
                                        mainFileRef.current = null;
                                        galleryFilesRef.current = [];
                                        setName("");
                                        setPrice("");
                                        setDescription("");
                                        setSuccessParams(false);
                                        setIsSubmitting(false);
                                    }, 2000);

                                } catch (e) {
                                    console.error(e);
                                    setIsSubmitting(false);
                                    toast.error("Failed to create product");
                                }
                            }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* COL 1: Visuals (4/12) */}
                                <div className="lg:col-span-4 space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Visuals</label>
                                    {/* Main Image */}
                                    <div className="aspect-square relative group bg-gray-50 hover:bg-white border-2 border-dashed border-gray-200 hover:border-brand-purple rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer shadow-sm">
                                        {mainImage ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <p className="text-white font-bold text-[10px] uppercase tracking-wide border border-white/50 px-3 py-1 rounded-full">Change Cover</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="w-12 h-12 bg-white shadow-md shadow-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-brand-purple group-hover:scale-110 transition-transform">
                                                    <ImageIcon size={20} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase group-hover:text-brand-purple transition-colors">Cover Image</p>
                                            </div>
                                        )}
                                        <input type="file" title="Upload cover" aria-label="Upload cover" accept="image/*" onChange={handleMainImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>

                                    {/* Gallery Row */}
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                        {gallery.map((url, idx) => (
                                            <div key={idx} className="shrink-0 w-16 h-16 relative rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                                <button
                                                    type="button"
                                                    title="Remove image"
                                                    aria-label="Remove image"
                                                    onClick={() => {
                                                        setGallery(prev => prev.filter((_, i) => i !== idx));
                                                        galleryFilesRef.current = galleryFilesRef.current.filter((_, i) => i !== idx);
                                                    }}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="shrink-0 w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-purple hover:border-brand-purple hover:bg-purple-50 transition-colors relative cursor-pointer">
                                            <Plus size={16} />
                                            <input type="file" title="Add gallery image" aria-label="Add gallery image" multiple accept="image/*" onChange={handleGallery} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 2: Details (8/12) */}
                                <div className="lg:col-span-8 space-y-5">
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Details</label>

                                        {/* Product Name */}
                                        <input
                                            name="name"
                                            title="Product Name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Product Name (e.g. Huggies Gold)"
                                            className={`${inputClass} text-lg`}
                                            required
                                        />

                                        {/* Price / Cost / Stock Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Price</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₵</span>
                                                    <input
                                                        name="price"
                                                        title="Price"
                                                        value={price}
                                                        onChange={e => setPrice(e.target.value)}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className={`${inputClass} pl-7`}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Cost <span className="bg-gray-100 px-1 rounded text-gray-500">PROFIT</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₵</span>
                                                    <input
                                                        name="costPrice"
                                                        title="Cost Price"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className={`${inputClass} pl-7 bg-gray-50/30`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Stock</label>
                                                <input
                                                    name="stockQty"
                                                    title="Stock Quantity"
                                                    type="number"
                                                    defaultValue="10"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        {/* Category & Tags Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Category</label>
                                                <select
                                                    name="category"
                                                    title="Category"
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    className={`${inputClass} appearance-none cursor-pointer`}
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-[38px] text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Tags</label>
                                                <div className="relative">
                                                    <input
                                                        value={tagInput}
                                                        title="Tags"
                                                        onChange={e => setTagInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                        placeholder="Add tag..."
                                                        className={inputClass}
                                                    />
                                                    <Tag size={14} className="absolute right-4 top-1/2 -translate-y-[20%] text-gray-400 opacity-50" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Valid Tags List */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">
                                                        {tag}
                                                        <button type="button" title="Remove tag" onClick={() => removeTag(tag)} className="hover:text-purple-900"><X size={10} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                            <button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={isGeneratingAI}
                                                className="text-[10px] font-black text-white bg-black hover:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-gray-200 hover:-translate-y-0.5 disabled:opacity-50"
                                            >
                                                {isGeneratingAI ? <span className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> : <Wand2 size={12} />}
                                                AI Generate
                                            </button>
                                        </div>
                                        <textarea
                                            name="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Product description..."
                                            className="w-full bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-purple-500 rounded-2xl px-5 py-4 min-h-[120px] resize-none font-medium text-gray-600 text-sm outline-none leading-relaxed focus:ring-4 focus:ring-purple-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100" />

                            {/* 4. Variants */}
                            {storeTier !== 'HUSTLER' && (
                                <section className="bg-gray-50/50 rounded-[24px] p-5 border border-dashed border-gray-200 relative group hover:border-purple-200 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700">
                                                <Layers size={16} />
                                            </div>
                                            <span className="font-black text-gray-800 uppercase tracking-widest text-xs">Variants</span>
                                        </div>
                                        <button type="button" onClick={addVariant} className="text-[10px] font-black text-white bg-gray-900 hover:bg-black px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md">
                                            + Add Variant
                                        </button>
                                    </div>

                                    {variants.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-xs font-bold rounded-2xl">
                                            No variants added yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {variants.map((v) => (
                                                <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-left-2 hover:shadow-md transition-all">
                                                    <div className="md:col-span-4">
                                                        <input
                                                            title="Variant Name"
                                                            placeholder="Name (e.g. Red)"
                                                            value={v.name}
                                                            onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                            className="w-full text-xs font-bold bg-transparent px-2 py-1 outline-none placeholder:font-normal"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <input
                                                            title="Variant Price Override"
                                                            placeholder="Price Override"
                                                            type="number"
                                                            value={v.price}
                                                            onChange={e => updateVariant(v.id, 'price', e.target.value)}
                                                            className="w-full text-xs font-medium bg-gray-50 rounded-lg px-3 py-2 outline-none focus:bg-gray-100 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            title="Variant Quantity"
                                                            placeholder="Qty"
                                                            type="number"
                                                            value={v.stockQty}
                                                            onChange={e => updateVariant(v.id, 'stockQty', e.target.value)}
                                                            className="w-full text-center text-xs font-medium bg-gray-50 rounded-lg px-3 py-2 outline-none focus:bg-gray-100 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            title="Variant SKU"
                                                            placeholder="SKU"
                                                            value={v.sku}
                                                            onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                                                            className="w-full text-xs font-medium bg-gray-50 rounded-lg px-3 py-2 outline-none focus:bg-gray-100 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1 text-center">
                                                        <button type="button" title="Remove Variant" aria-label="Remove Variant" onClick={() => removeVariant(v.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}


                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !!successParams}
                                    className={`w-full font-black text-lg py-4 rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-3 tracking-wide ${successParams
                                        ? "bg-green-500 text-white hover:scale-100 cursor-default"
                                        : isSubmitting
                                            ? "bg-gray-800 text-gray-400 cursor-wait"
                                            : "bg-gray-900 hover:bg-black text-white hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Posting...
                                        </>
                                    ) : successParams ? (
                                        <>
                                            <CheckCircle size={24} className="animate-in zoom-in spin-in-90 duration-300" />
                                            Posted!
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} className="stroke-[3px]" />
                                            Publish Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Live Preview (5/12 cols) */}
                <div className={`xl:col-span-5 relative ${viewMode === 'preview' ? 'block' : 'hidden xl:block'
                    }`}>
                    <div className="sticky top-8 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-8">
                            <Smartphone size={16} className="text-gray-400" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Preview</span>
                        </div>

                        {/* iPhone 17 Mockup */}
                        <div className="relative w-[380px] h-[780px] bg-gray-900 rounded-[55px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-gray-900 ring-1 ring-gray-800 overflow-hidden select-none pointer-events-none">
                            {/* Dynamic Island */}
                            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-30 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ml-auto mr-3" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0f0f0f] opacity-50 mr-1" />
                            </div>

                            {/* Status Bar */}
                            <div className="absolute top-[22px] left-[32px] right-[32px] h-[20px] z-20 flex justify-between items-center px-1 pointer-events-none">
                                {/* Time - Left aligned properly for Dynamic Island */}
                                <span className="text-[15px] text-black font-semibold tracking-tight ml-2" style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>

                                <div className="flex gap-1.5 items-center mr-2">
                                    {/* Signal - 4 bars, varying height */}
                                    <div className="flex gap-[1px] items-end h-[10px] mr-1">
                                        <div className="w-[3px] h-[4px] bg-black rounded-[0.5px]" />
                                        <div className="w-[3px] h-[6px] bg-black rounded-[0.5px]" />
                                        <div className="w-[3px] h-[8px] bg-black rounded-[0.5px]" />
                                        <div className="w-[3px] h-[10px] bg-black rounded-[0.5px]" />
                                    </div>
                                    {/* WiFi - Modern Curve */}
                                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-0.5">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 8.35715C7.45624 8.35715 6.94082 8.5534 6.53936 8.87611L7.79249 10.4424C7.89803 10.5738 8.10229 10.5738 8.20783 10.4424L9.46016 8.87652C9.0587 8.5534 8.5435 8.35715 8.00016 8.35715ZM2.83447 5.81188C4.22301 4.64834 6.03016 4.00001 8.00016 4.00001C9.97016 4.00001 11.7773 4.64834 13.1659 5.81188L11.5714 7.80521C10.6301 6.9898 9.37891 6.50501 8.00016 6.50501C6.62141 6.50501 5.37082 6.99021 4.42891 7.80563L2.83447 5.81188ZM7.99979 1.74084C5.15562 1.74084 2.56417 2.72876 1.38083 4.31834C1.26854 4.46917 1.32583 4.68209 1.4975 4.76167C1.49937 4.76251 1.50125 4.76355 1.50312 4.76438L3.33021 7.04834C3.43542 7.1798 3.64021 7.1798 3.74542 7.04834L5.48291 4.87667C6.19937 4.32709 7.06854 4.00001 7.99937 4.00001C8.92979 4.00001 9.79917 4.32709 10.5154 4.87667L12.2533 7.04834C12.3585 7.1798 12.5633 7.1798 12.6685 7.04834L14.4958 4.76438C14.4977 4.76355 14.4996 4.76251 14.5015 4.76167C14.673 4.68209 14.7303 4.46917 14.6181 4.31834C13.4348 2.72876 10.8431 1.74084 7.99979 1.74084Z" fill="black" />
                                    </svg>
                                    {/* Battery with Percentage */}
                                    <div className="flex items-center gap-1">
                                        <div className="w-[25px] h-[12px] border border-black/30 rounded-[3px] relative p-[1px] flex items-center bg-transparent">
                                            <div className="h-full bg-black rounded-[1px]" style={{ width: '100%' }} />
                                        </div>
                                        <div className="w-[1.5px] h-[4px] bg-black/30 rounded-r-[1px] -ml-[3px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content */}
                            <div className="w-full h-full bg-white relative flex flex-col overflow-hidden rounded-[38px]">
                                {/* App Bar */}
                                <div className="h-24 pt-8 px-6 bg-white/80 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0 border-b border-gray-100/50">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><Box size={16} className="text-gray-900" /></div>
                                    <span className="text-sm font-black text-gray-900">Product Details</span>
                                    <div className="w-8 h-8"></div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-28">
                                    {/* Image Carousel */}
                                    <div className="aspect-[4/5] bg-white relative mb-0">
                                        {mainImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={mainImage} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100/50">
                                                <ImageIcon size={64} className="opacity-20 mb-4" />
                                            </div>
                                        )}
                                        {gallery.length > 0 && (
                                            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/20">
                                                1 / {gallery.length + 1}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 -mt-6 relative bg-white rounded-t-[32px] shadow-2xl shadow-black/5 space-y-6">

                                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-2" />

                                        {/* Header */}
                                        <div>
                                            <div className="flex justify-between items-start mb-3 gap-4">
                                                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                    {name || "Product Name"}
                                                </h3>
                                            </div>
                                            <p className="text-2xl font-black text-brand-orange">
                                                ₵{price || "0.00"}
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(t => (
                                                    <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-wide border border-gray-200">{t}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variants */}
                                        {variants.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Select Option</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {variants.map((v, i) => (
                                                        <span key={v.id} className={`px-4 py-3 border-2 rounded-2xl text-xs font-bold ${i === 0 ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-600'}`}>
                                                            {v.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Description</p>
                                            <div className="prose prose-sm prose-gray">
                                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                                    {description || "Product description will appear here..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add to Cart Bar */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center gap-4 pb-8 z-20">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-900 border border-gray-200">
                                        <Box size={22} />
                                    </div>
                                    <button className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-200">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
