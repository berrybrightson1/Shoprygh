"use client";

import { Plus, X, Image as ImageIcon, Sparkles, Smartphone, Box, Trash2, Upload, Tag, ChevronDown, Wand2, Package, Layers, CheckCircle, Truck, Hash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { compressImage } from "@/utils/imageCompression";
import { toast } from "sonner";
import BrandedSelect from "./shared/BrandedSelect";

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
                    className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 select-none ${viewMode === 'edit'
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
                    className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 select-none ${viewMode === 'preview'
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
    const borderClass = "border-gray-200/50 focus:border-brand-cyan/30 hover:border-gray-300/50";
    const inputClass = "w-full bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200/50 focus:border-brand-cyan/30 rounded-2xl px-5 py-4 font-normal text-gray-900 text-sm outline-none transition-all placeholder:text-gray-300 shadow-sm focus:ring-4 focus:ring-brand-cyan/5";

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [priceWholesale, setPriceWholesale] = useState("");
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

            let imageBase64: string | null = null;

            // Priority 1: New file selected
            if (mainFileRef.current) {
                const reader = new FileReader();
                imageBase64 = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(mainFileRef.current!);
                });
            } else if (mainImage && mainImage.startsWith('blob:')) {
                // Priority 2: Fetched blob (shouldn't happen often if ref is kept in sync, but for safety)
                try {
                    const response = await fetch(mainImage);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    imageBase64 = await new Promise((resolve) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.warn("Could not convert blob URL to base64", e);
                }
            }

            const result = await generateProductDescription(name, tags, category, imageBase64);

            if (result.success && result.description) {
                setDescription(result.description);
                toast.success("AI description generated with Gemini!");
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

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-12 mb-20 pb-24 animate-in fade-in duration-700">
                {/* LEFT: Editor Form (7/12 cols) */}
                <div className={`xl:col-span-7 space-y-6 ${viewMode === 'preview' ? 'hidden xl:block' : ''}`}>
                    <div className="bg-white p-5 md:p-8 lg:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">

                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-medium text-gray-900 flex items-center gap-3 tracking-tight">
                                    <span className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center border border-purple-100 shadow-sm shrink-0">
                                        <Sparkles size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                                    </span>
                                    Creator Studio
                                </h2>
                                <p className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-widest ml-1 mt-2">Craft your next bestseller</p>
                            </div>
                            <div className="flex gap-2 self-start md:self-auto">
                                <span className="px-6 py-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100/50 text-[10px] font-medium uppercase tracking-widest whitespace-nowrap">
                                    Drafting Workspace
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
                                    if (priceWholesale) formData.set("priceWholesale", priceWholesale);
                                    galleryFilesRef.current.forEach(f => formData.append("gallery", f));
                                    formData.set("tags", JSON.stringify(tags));
                                    formData.set("variants", JSON.stringify(variants));

                                    await createAction(formData);

                                    {/* Success State */ }
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
                                        setPriceWholesale("");
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
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

                                {/* COL 1: Visuals (4/12) */}
                                <div className="lg:col-span-4 space-y-4">
                                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4 ml-1">Asset Library</label>
                                    {/* Main Image */}
                                    <div className="aspect-square relative group bg-gray-50 hover:bg-white border-2 border-dashed border-gray-100/50 hover:border-brand-purple/30 rounded-[32px] flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer shadow-inner">
                                        {mainImage ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <p className="text-white font-medium text-[10px] uppercase tracking-[0.2em] border border-white/50 px-5 py-2 rounded-xl">Refresh Cover</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-xl shadow-gray-200 rounded-[24px] flex items-center justify-center mx-auto mb-4 text-brand-purple/50 group-hover:scale-110 transition-transform border border-gray-50">
                                                    <Plus size={24} strokeWidth={2} />
                                                </div>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest group-hover:text-brand-purple transition-colors">Primary Cover</p>
                                            </div>
                                        )}
                                        <input type="file" title="Upload cover" aria-label="Upload cover" accept="image/*" onChange={handleMainImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>

                                    {/* Gallery Row */}
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {gallery.map((url, idx) => (
                                            <div key={idx} className="shrink-0 w-16 h-16 md:w-20 md:h-20 relative rounded-2xl overflow-hidden border border-gray-100 group bg-gray-100 shadow-sm">
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
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:text-brand-purple hover:border-brand-purple hover:bg-purple-50 transition-all relative cursor-pointer active:scale-95">
                                            <Plus size={20} strokeWidth={3} />
                                            <input type="file" title="Add gallery image" aria-label="Add gallery image" multiple accept="image/*" onChange={handleGallery} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {/* COL 2: Details (8/12) */}
                                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                                    <div className="space-y-6 md:space-y-8">
                                        <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-4 ml-1">Specifications</label>

                                        {/* Product Name */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Display Identity</label>
                                            <input
                                                name="name"
                                                title="Product Name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="e.g. Premium Silk Bundle"
                                                className={`${inputClass} text-base md:text-lg py-4 md:py-5`}
                                                required
                                            />
                                        </div>

                                        {/* Price / Cost / Stock Grid */}
                                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                                            {/* Price */}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Retail Value</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₵</span>
                                                    <input
                                                        name="price"
                                                        title="Price"
                                                        value={price}
                                                        onChange={e => setPrice(e.target.value)}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className={`${inputClass} pl-8 md:pl-10`}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Wholesale (Conditional) or Cost */}
                                            {storeTier === 'WHOLESALER' ? (
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-medium text-brand-purple uppercase tracking-widest ml-1 flex items-center gap-2">
                                                        Wholesale Tier
                                                        <span className="bg-purple-50 text-brand-purple px-2 py-0.5 rounded-lg text-[8px] border border-purple-100/50">PLATINUM</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-purple font-medium text-sm">₵</span>
                                                        <input
                                                            value={priceWholesale}
                                                            title="Wholesale Price"
                                                            onChange={e => setPriceWholesale(e.target.value)}
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            className={`${inputClass} pl-10 border-purple-100 bg-purple-50/10 focus:border-brand-purple focus:ring-brand-purple/5`}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Acquisition Cost</label>
                                                    <div className="relative">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 font-medium text-sm">₵</span>
                                                        <input
                                                            name="costPrice"
                                                            title="Cost Price"
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            className={`${inputClass} pl-10 bg-gray-50/20`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Row 2 */}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1 text-center">Initial Stock</label>
                                                <div className="relative">
                                                    <Box size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="stockQty"
                                                        title="Stock Quantity"
                                                        type="number"
                                                        defaultValue="10"
                                                        className={`${inputClass} pl-12 text-center`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Logistics Tier</label>
                                                <BrandedSelect
                                                    name="logisticsTier"
                                                    options={["Standard Delivery", "Express Hub", "Warehouse Only"]}
                                                    value="Standard Delivery"
                                                    onChange={() => { }} // Internal state handled by name
                                                    icon={<Truck size={16} />}
                                                />
                                            </div>
                                        </div>

                                        {/* Category & Tags Grid */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Sector</label>
                                                <BrandedSelect
                                                    name="category"
                                                    options={CATEGORIES}
                                                    value={category}
                                                    onChange={(val) => setCategory(val)}
                                                    icon={<Layers size={16} />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">Search Keywords</label>
                                                <div className="relative">
                                                    <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        value={tagInput}
                                                        title="Tags"
                                                        onChange={e => setTagInput(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                        placeholder="Enter keywords..."
                                                        className={`${inputClass} pl-12`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tag Chips */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-[10px] font-medium rounded-xl uppercase tracking-widest shadow-lg shadow-gray-200">
                                                        {tag}
                                                        <button type="button" title="Remove tag" onClick={() => removeTag(tag)} className="hover:text-brand-orange transition-colors"><X size={10} strokeWidth={3} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest">Narrative Depth</label>
                                            <button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={isGeneratingAI}
                                                className="text-[10px] font-medium text-white bg-black hover:bg-brand-cyan hover:text-black px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                            >
                                                {isGeneratingAI ? <span className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> : <Wand2 size={12} strokeWidth={2} />}
                                                Intelligence Hub
                                            </button>
                                        </div>
                                        <textarea
                                            name="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Write a compelling story for this product..."
                                            className="w-full bg-gray-50 border border-gray-200/50 rounded-[32px] px-5 py-4 md:px-8 md:py-6 min-h-[150px] md:min-h-[180px] resize-none font-normal text-gray-900 text-sm md:text-[15px] outline-none leading-relaxed focus:border-brand-cyan/30 focus:bg-white focus:ring-4 focus:ring-brand-cyan/5 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="h-px bg-gray-100" />

                            {/* 4. Variants */}
                            {storeTier !== 'HUSTLER' && (
                                <section className="bg-gray-50/50 rounded-[32px] p-5 md:p-8 border border-gray-100 relative group transition-colors">
                                    <div className="flex items-center justify-between mb-6 md:mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 md:p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-900">
                                                <Layers size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
                                            </div>
                                            <span className="font-medium text-gray-900 uppercase tracking-widest text-xs">SKU Variations</span>
                                        </div>
                                        <button type="button" onClick={addVariant} className="text-[9px] md:text-[10px] font-medium text-brand-cyan bg-white hover:bg-brand-cyan hover:text-white border border-cyan-100/50 px-3 py-1.5 md:px-6 md:py-3 rounded-xl transition-all active:scale-95 shadow-sm uppercase tracking-widest">
                                            + Add Model
                                        </button>
                                    </div>

                                    {variants.length === 0 ? (
                                        <div className="text-center py-10 md:py-12 text-gray-400 text-[10px] font-medium uppercase tracking-widest border-2 border-dashed border-gray-100/50 rounded-[28px]">
                                            No distinct variants configured
                                        </div>
                                    ) : (
                                        <div className="space-y-3 md:space-y-4">
                                            {variants.map((v) => (
                                                <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 md:p-6 rounded-[24px] border border-gray-100 shadow-sm animate-in slide-in-from-left-4 hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                                                    <div className="md:col-span-4">
                                                        <input
                                                            title="Variant Name"
                                                            placeholder="Model Name (e.g. XL)"
                                                            value={v.name}
                                                            onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                            className="w-full text-sm font-medium bg-gray-50 rounded-xl px-4 py-3 outline-none focus:bg-white border border-transparent focus:border-brand-cyan/30 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-3">
                                                        <input
                                                            title="Variant Price Override"
                                                            placeholder="Custom Price"
                                                            type="number"
                                                            value={v.price}
                                                            onChange={e => updateVariant(v.id, 'price', e.target.value)}
                                                            className="w-full text-sm font-medium bg-gray-50 rounded-xl px-4 py-3 outline-none focus:bg-white border border-transparent focus:border-brand-cyan/30 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            title="Variant Quantity"
                                                            placeholder="Qty"
                                                            type="number"
                                                            value={v.stockQty}
                                                            onChange={e => updateVariant(v.id, 'stockQty', e.target.value)}
                                                            className="w-full text-center text-sm font-medium bg-gray-50 rounded-xl px-4 py-3 outline-none focus:bg-white border border-transparent focus:border-brand-cyan/30 transition"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <input
                                                            title="Variant SKU"
                                                            placeholder="SKU-CODE"
                                                            value={v.sku}
                                                            onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                                                            className="w-full text-center text-[10px] font-medium bg-gray-50 rounded-xl px-4 py-3 outline-none focus:bg-white border border-transparent focus:border-brand-cyan/30 transition uppercase tracking-widest"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1 text-center">
                                                        <button type="button" title="Remove Variant" aria-label="Remove Variant" onClick={() => removeVariant(v.id)} className="text-gray-300 hover:text-brand-orange transition-all p-2 hover:bg-orange-50 rounded-xl">
                                                            <Trash2 size={18} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}


                            {/* Submit */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !!successParams}
                                    className={`w-full font-medium text-xs md:text-lg py-3 md:py-6 rounded-2xl md:rounded-[32px] shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-4 tracking-[0.1em] uppercase ${successParams
                                        ? "bg-emerald-500 text-white shadow-emerald-200"
                                        : isSubmitting
                                            ? "bg-gray-100 text-gray-400 cursor-wait shadow-none"
                                            : "bg-black text-white shadow-black/10 hover:shadow-black/20 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 md:w-6 md:h-6 border-2 md:border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span className="hidden md:inline">Synchronizing Assets...</span>
                                            <span className="md:hidden">Syncing...</span>
                                        </>
                                    ) : successParams ? (
                                        <>
                                            <CheckCircle size={20} className="md:w-7 md:h-7 animate-in zoom-in spin-in-90 duration-500" />
                                            <span className="hidden md:inline">Catalog Updated</span>
                                            <span className="md:hidden">Updated</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} className="md:w-6 md:h-6" strokeWidth={3} />
                                            <span className="hidden md:inline">Publish to Live Store</span>
                                            <span className="md:hidden">Publish Store</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-[9px] md:text-[10px] text-gray-400 font-medium text-center mt-3 md:mt-6 uppercase tracking-widest opacity-50">Instant deployment</p>
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
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Live Preview</span>
                        </div>

                        {/* iPhone 17 Mockup (Desktop Only Frame) */}
                        <div className="relative w-full h-[80vh] xl:w-[380px] xl:h-[780px] bg-transparent xl:bg-gray-900 xl:rounded-[55px] xl:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] xl:border-[8px] xl:border-gray-900 xl:ring-1 xl:ring-gray-800 overflow-hidden select-none transition-all duration-300">
                            {/* Dynamic Island - Desktop Only */}
                            <div className="hidden xl:flex absolute top-[18px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-30 items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#1a1a1a] ml-auto mr-3" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0f0f0f] opacity-50 mr-1" />
                            </div>

                            {/* Status Bar - Desktop Only */}
                            <div className="hidden xl:flex absolute top-[22px] left-[32px] right-[32px] h-[20px] z-20 justify-between items-center px-1 pointer-events-none">
                                {/* Time - Left aligned properly for Dynamic Island */}
                                <span className="text-[15px] text-black font-semibold tracking-tight ml-4 font-sans tabular-nums">9:41</span>

                                <div className="flex gap-2 items-center mr-4">
                                    {/* WiFi - Modern Curve (Simplified) */}
                                    <svg width="18" height="13" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-0.5 scale-90">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.00016 8.35715C7.45624 8.35715 6.94082 8.5534 6.53936 8.87611L7.79249 10.4424C7.89803 10.5738 8.10229 10.5738 8.20783 10.4424L9.46016 8.87652C9.0587 8.5534 8.5435 8.35715 8.00016 8.35715ZM2.83447 5.81188C4.22301 4.64834 6.03016 4.00001 8.00016 4.00001C9.97016 4.00001 11.7773 4.64834 13.1659 5.81188L11.5714 7.80521C10.6301 6.9898 9.37891 6.50501 8.00016 6.50501C6.62141 6.50501 5.37082 6.99021 4.42891 7.80563L2.83447 5.81188ZM7.99979 1.74084C5.15562 1.74084 2.56417 2.72876 1.38083 4.31834C1.26854 4.46917 1.32583 4.68209 1.4975 4.76167C1.49937 4.76251 1.50125 4.76355 1.50312 4.76438L3.33021 7.04834C3.43542 7.1798 3.64021 7.1798 3.74542 7.04834L5.48291 4.87667C6.19937 4.32709 7.06854 4.00001 7.99937 4.00001C8.92979 4.00001 9.79917 4.32709 10.5154 4.87667L12.2533 7.04834C12.3585 7.1798 12.5633 7.1798 12.6685 7.04834L14.4958 4.76438C14.4977 4.76355 14.4996 4.76251 14.5015 4.76167C14.673 4.68209 14.7303 4.46917 14.6181 4.31834C13.4348 2.72876 10.8431 1.74084 7.99979 1.74084Z" fill="black" />
                                    </svg>
                                    {/* Battery with Percentage */}
                                    <div className="flex items-center gap-1">
                                        <div className="w-[25px] h-[12px] border border-black/30 rounded-[3px] relative p-[1px] flex items-center bg-transparent">
                                            <div className="h-full bg-black rounded-[1px] w-full" />
                                        </div>
                                        <div className="w-[1.5px] h-[4px] bg-black/30 rounded-r-[1px] -ml-[3px]" />
                                    </div>
                                </div>
                            </div>

                            {/* Screen Content */}
                            <div className="w-full h-full bg-white relative flex flex-col overflow-hidden rounded-3xl xl:rounded-[38px] border border-gray-200 xl:border-none shadow-sm xl:shadow-none">
                                {/* App Bar */}
                                <div className="h-24 pt-8 px-6 bg-white/80 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0 border-b border-gray-100/50">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><Box size={16} className="text-gray-900" /></div>
                                    <span className="text-sm font-medium text-gray-900">Product Details</span>

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
                                            <div className="absolute bottom-6 right-6 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-medium border border-white/20">
                                                1 / {gallery.length + 1}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 -mt-6 relative bg-white rounded-t-[32px] shadow-2xl shadow-black/5 space-y-6">

                                        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-2" />

                                        {/* Header */}
                                        <div>
                                            <div className="flex justify-between items-start mb-3 gap-4">
                                                <h3 className="text-2xl font-medium text-gray-900 leading-tight">
                                                    {name || "Product Name"}
                                                </h3>
                                            </div>
                                            <p className="text-2xl font-medium text-brand-orange">
                                                ₵{price || "0.00"}
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(t => (
                                                    <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full uppercase tracking-wide border border-gray-200">{t}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Variants */}
                                        {variants.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-medium text-gray-400 mb-3 uppercase tracking-widest">Select Option</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {variants.map((v, i) => (
                                                        <span key={v.id} className={`px-4 py-3 border-2 rounded-2xl text-xs font-medium ${i === 0 ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-600'}`}>
                                                            {v.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div>
                                            <p className="text-[10px] font-medium text-gray-400 mb-3 uppercase tracking-widest">Description</p>
                                            <div className="prose prose-sm prose-gray">
                                                <p className="text-sm text-gray-500 leading-relaxed font-normal">
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
                                    <button className="flex-1 bg-gray-900 text-white font-medium py-4 rounded-2xl shadow-xl shadow-gray-200">
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
