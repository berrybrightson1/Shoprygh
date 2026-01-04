"use client";

import { Plus, X, Image as ImageIcon, Sparkles, Smartphone, Box, Trash2, Upload, Tag, ChevronDown, Wand2 } from "lucide-react";
import { useState, useRef } from "react";
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

export default function CreatorStudio({
    createAction,
    storeTier = 'HUSTLER'
}: {
    createAction: (formData: FormData) => Promise<void>,
    storeTier?: string
}) {
    // --- State ---
    const borderClass = "border-gray-200 focus:border-brand-purple hover:border-gray-300";
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Diapers");
    const [description, setDescription] = useState("");

    // Images
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);
    const [isCompressing, setIsCompressing] = useState(false);

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
    const generateDescription = () => {
        if (!name) {
            toast.error("Please enter a product name first!");
            return;
        }

        const templates = [
            `Experience the best quality with ${name}. Perfect for your ${category.toLowerCase()} needs.`,
            `High quality ${category.toLowerCase()} product. ${name} is designed for comfort and durability.`,
            `Get the amazing ${name} now. A clear favorite in our ${category} collection.`
        ];
        setDescription(templates[Math.floor(Math.random() * templates.length)]);
        toast.success("Description generated!");
    };


    // --- Render ---

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mb-20 animate-in fade-in duration-500">
            {/* LEFT: Editor Form (7/12 cols) */}
            <div className="xl:col-span-7 space-y-4">
                <div className="bg-white p-5 lg:p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-purple-600 fill-purple-100" size={24} />
                                Creator Studio
                            </h2>
                            <p className="text-gray-500 font-bold text-xs ml-1">Craft your next bestseller.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-black uppercase tracking-wide">
                                Draft
                            </span>
                        </div>
                    </div>

                    <form
                        ref={formRef}
                        action={async (formData) => {
                            if (mainFileRef.current) formData.set("image", mainFileRef.current);
                            galleryFilesRef.current.forEach(f => formData.append("gallery", f));
                            formData.set("tags", JSON.stringify(tags));
                            formData.set("variants", JSON.stringify(variants));

                            await createAction(formData);

                            // Reset
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
                            toast.success("Product published successfully!");
                        }}
                        className="space-y-5"
                    >
                        {/* 1. Basic Info */}
                        <section className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase">Product Name</label>
                                    <input
                                        name="name"
                                        title="Product Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Huggies Gold"
                                        className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-2.5 font-bold text-gray-900 text-sm outline-none transition-all placeholder:text-gray-300`}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase">Price (₵)</label>
                                        <input
                                            name="price"
                                            title="Price"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-2.5 font-bold text-gray-900 text-sm outline-none transition-all placeholder:text-gray-300`}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase">Stock</label>
                                        <input
                                            name="stockQty"
                                            title="Stock Quantity"
                                            type="number"
                                            defaultValue="10"
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-2.5 font-bold text-gray-900 text-sm outline-none transition-all text-center`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-50" />

                        {/* 2. Visuals */}
                        <section className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visuals</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                                    {/* Main Image Uploader */}
                                    <div className="snap-start shrink-0 w-28 h-28 md:w-32 md:h-32 relative group bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer">
                                        {mainImage ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white font-bold text-[10px] uppercase tracking-wide">Change</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-3">
                                                <div className="w-8 h-8 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                                                    <ImageIcon size={16} />
                                                </div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Cover</p>
                                            </div>
                                        )}
                                        <input type="file" title="Upload cover image" aria-label="Upload cover image" accept="image/*" onChange={handleMainImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>

                                    {/* Gallery Images */}
                                    {gallery.map((url, idx) => (
                                        <div key={idx} className="snap-start shrink-0 w-28 h-28 md:w-32 md:h-32 relative rounded-2xl overflow-hidden border border-gray-200 group bg-gray-100">
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
                                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add More Button */}
                                    <div className="snap-start shrink-0 w-28 h-28 md:w-32 md:h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500 hover:text-purple-600 text-gray-300 transition-all cursor-pointer relative group">
                                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-bold uppercase mt-1">Add</span>
                                        <input type="file" title="Upload gallery images" aria-label="Upload gallery images" multiple accept="image/*" onChange={handleGallery} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-50" />

                        {/* 3. Classification & AI */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            title="Select Category"
                                            aria-label="Select Category"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-2.5 appearance-none font-bold text-gray-900 text-sm outline-none`}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase">Tags</label>
                                    <div className="relative">
                                        <input
                                            value={tagInput}
                                            title="Add a tag"
                                            aria-label="Add a tag"
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Type tag & hit Enter..."
                                            className={`w-full bg-white border ${borderClass} rounded-xl px-4 py-2.5 text-xs font-medium pr-8 outline-none`}
                                        />
                                        <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">
                                                {tag}
                                                <button type="button" title="Remove tag" onClick={() => removeTag(tag)} className="hover:text-purple-900"><X size={10} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col h-full space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase">Description</label>
                                    <button
                                        type="button"
                                        onClick={generateDescription}
                                        className="text-[10px] font-black text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                                    >
                                        <Wand2 size={10} /> AI Generate
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    title="Product Description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe your product vertically..."
                                    className={`w-full flex-1 bg-gray-50 border ${borderClass} rounded-xl px-4 py-2.5 min-h-[100px] resize-none font-medium text-gray-600 text-sm outline-none leading-relaxed`}
                                />
                            </div>
                        </section>

                        <hr className="border-gray-50" />

                        {/* 4. Variants */}
                        {storeTier !== 'HUSTLER' && (
                            <section className="bg-gray-50 rounded-2xl p-4 border border-gray-200/60 dashed-border relative">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1.5 bg-white rounded-md shadow-sm text-gray-700">
                                            <Box size={14} />
                                        </div>
                                        <span className="font-black text-gray-800 uppercase tracking-wide text-xs">Variants</span>
                                    </div>
                                    <button type="button" onClick={addVariant} className="text-[10px] font-black text-white bg-gray-900 hover:bg-black px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md">
                                        + Add
                                    </button>
                                </div>

                                {variants.length === 0 ? (
                                    <div className="text-center py-4 text-gray-400 text-xs font-medium border-2 border-dashed border-gray-200 rounded-lg">
                                        No variants added.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {variants.map((v) => (
                                            <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm animate-in slide-in-from-left-2">
                                                <div className="md:col-span-4">
                                                    <input
                                                        title="Variant Name"
                                                        placeholder="Name (e.g. Red)"
                                                        value={v.name}
                                                        onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                        className="w-full text-xs font-bold bg-transparent px-2 outline-none placeholder:font-normal"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <input
                                                        title="Variant Price Override"
                                                        placeholder="Price Override"
                                                        type="number"
                                                        value={v.price}
                                                        onChange={e => updateVariant(v.id, 'price', e.target.value)}
                                                        className="w-full text-xs font-medium bg-gray-50 rounded px-2 py-1 outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <input
                                                        title="Variant Quantity"
                                                        placeholder="Qty"
                                                        type="number"
                                                        value={v.stockQty}
                                                        onChange={e => updateVariant(v.id, 'stockQty', e.target.value)}
                                                        className="w-full text-center text-xs font-medium bg-gray-50 rounded px-2 py-1 outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <input
                                                        title="Variant SKU"
                                                        placeholder="SKU"
                                                        value={v.sku}
                                                        onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                                                        className="w-full text-xs font-medium bg-gray-50 rounded px-2 py-1 outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-1 text-center">
                                                    <button type="button" title="Remove Variant" aria-label="Remove Variant" onClick={() => removeVariant(v.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}


                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-lg py-3.5 rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 tracking-wide"
                            >
                                <Upload size={18} className="stroke-[3px]" />
                                Publish Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* RIGHT: Live Preview (5/12 cols) */}
            <div className="xl:col-span-5 hidden xl:block relative">
                <div className="sticky top-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <Smartphone size={16} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Live Preview</span>
                    </div>

                    {/* iPhone 13 Mockup */}
                    <div className="relative w-[380px] h-[780px] bg-gray-900 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-gray-900 ring-1 ring-gray-700 overflow-hidden select-none pointer-events-none">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[160px] h-[30px] bg-gray-900 rounded-b-[20px] z-30" />

                        {/* Status Bar Mock */}
                        <div className="absolute top-[5px] left-[30px] right-[30px] h-[20px] z-20 flex justify-between px-2">
                            <span className="text-[10px] text-white font-semibold">9:41</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-3 bg-white rounded-sm" />
                                <div className="w-4 h-3 bg-white rounded-sm" />
                                <div className="w-5 h-3 bg-white rounded-sm" />
                            </div>
                        </div>

                        {/* Screen Content */}
                        <div className="w-full h-full bg-white relative flex flex-col overflow-hidden rounded-[38px]">
                            {/* App Bar */}
                            <div className="h-20 pt-8 px-6 bg-white/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0 border-b border-gray-50">
                                <Box size={20} className="text-gray-900" />
                                <span className="text-sm font-black text-gray-900">Product Details</span>
                                <Box size={20} className="text-transparent" />
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/50 pb-20">
                                {/* Image Carousel */}
                                <div className="aspect-[4/5] bg-gray-200 relative mb-6">
                                    {mainImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={mainImage} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                                            <ImageIcon size={48} className="opacity-50" />
                                        </div>
                                    )}
                                    {gallery.length > 0 && (
                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold">
                                            1 / {gallery.length + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 space-y-6">
                                    {/* Header */}
                                    <div>
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                {name || "Product Name"}
                                            </h3>
                                        </div>
                                        <p className="text-xl font-black text-purple-600">
                                            ₵{price || "0.00"}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(t => (
                                                <span key={t} className="px-2.5 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">{t}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Variants */}
                                    {variants.length > 0 && (
                                        <div>
                                            <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Select Option</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variants.map((v, i) => (
                                                    <span key={v.id} className={`px-4 py-2 border rounded-xl text-xs font-bold ${i === 0 ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                                                        {v.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">Description</p>
                                        <div className="prose prose-sm prose-gray">
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {description || "Product description will appear here..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex items-center gap-4 pb-8">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 text-gray-900">
                                    <Box size={20} />
                                </div>
                                <button className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gray-200">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
