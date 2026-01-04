"use client";

import { Plus, X, Image as ImageIcon, Sparkles, Smartphone, Box, Trash2, Upload, Tag, ChevronDown, Wand2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { compressImage } from "@/utils/imageCompression";

interface Variant {
    id: string; // Temp ID for UI
    name: string;
    price: string;
    stockQty: string;
    sku: string;
}

export default function CreatorStudio({
    createAction,
    storeTier = 'HUSTLER'
}: {
    createAction: (formData: FormData) => Promise<void>,
    storeTier?: string
}) {
    // --- State ---
    const borderClass = "border-gray-200 focus:border-brand-cyan hover:border-gray-300";
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Diapers");
    const [description, setDescription] = useState("");

    // Images
    const [mainImage, setMainImage] = useState<string | null>(null); // Preview URL
    const [gallery, setGallery] = useState<string[]>([]); // Preview URLs
    const [isCompressing, setIsCompressing] = useState(false);

    // File Refs for Form Submission
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

    // --- AI Stub ---
    const generateDescription = () => {
        const templates = [
            `Experience the best quality with ${name || 'this item'}. Perfect for ${category.toLowerCase()} needs.`,
            `High quality ${category.toLowerCase()} product. ${name || 'Item'} is designed for comfort and durability.`,
            `Get the amazing ${name || 'product'} now. A clear favorite in our ${category} collection.`
        ];
        setDescription(templates[Math.floor(Math.random() * templates.length)]);
    };


    // --- Render ---

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
            {/* LEFT: Editor Form */}
            <div className="xl:col-span-2 space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan via-blue-500 to-purple-600" />

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-brand-orange filling-brand-orange" size={24} />
                                Creator Studio
                            </h2>
                            <p className="text-gray-500 font-bold mt-1">Design your product listing</p>
                        </div>
                        <div className="hidden md:flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-wide">
                                Draft
                            </span>
                        </div>
                    </div>

                    <form
                        ref={formRef}
                        action={async (formData) => {
                            // Append custom state
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
                        }}
                        className="space-y-8"
                    >
                        {/* 1. Basic Info */}
                        <section className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Product Name</label>
                                    <input
                                        name="name"
                                        title="Product Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Huggies Gold"
                                        className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-3 font-bold text-gray-900 outline-none transition-all`}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase mb-2">Price (₵)</label>
                                        <input
                                            name="price"
                                            title="Price"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-3 font-bold text-gray-900 outline-none transition-all`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase mb-2">Stock</label>
                                        <input
                                            name="stockQty"
                                            title="Stock Quantity"
                                            type="number"
                                            defaultValue="10"
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-3 font-bold text-gray-900 outline-none transition-all`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Visuals */}
                        <section>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-3">Visuals</label>
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Main Image */}
                                <div className="relative group w-full md:w-1/3 aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-brand-cyan hover:bg-cyan-50/30 transition-all cursor-pointer">
                                    {mainImage ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={mainImage} className="w-full h-full object-cover" alt="Main" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-bold text-sm">Change Cover</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                                                <ImageIcon size={24} />
                                            </div>
                                            <p className="text-xs font-black text-gray-500 uppercase">Cover Image</p>
                                        </div>
                                    )}
                                    <input type="file" title="Upload cover image" aria-label="Upload cover image" accept="image/*" onChange={handleMainImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>

                                {/* Gallery Grid */}
                                <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4 content-start">
                                    {gallery.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
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
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:border-brand-cyan hover:text-brand-cyan text-gray-400 transition-colors cursor-pointer relative">
                                        <Plus size={24} />
                                        <span className="text-[10px] font-bold uppercase mt-1">Add</span>
                                        <input type="file" title="Upload gallery images" aria-label="Upload gallery images" multiple accept="image/*" onChange={handleGallery} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Details & AI */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            title="Select Category"
                                            aria-label="Select Category"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-3 appearance-none font-bold text-gray-900 outline-none`}
                                        >
                                            <option>Diapers</option>
                                            <option>Feeding</option>
                                            <option>Clothing</option>
                                            <option>Toys</option>
                                            <option>Health</option>
                                            <option>Bedding</option>
                                            <option>Bundles</option>
                                            <option>General</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                                {tag}
                                                <X size={12} className="cursor-pointer hover:text-blue-900" onClick={() => removeTag(tag)} />
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            value={tagInput}
                                            title="Add a tag"
                                            aria-label="Add a tag"
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Add tag..."
                                            className={`w-full bg-white border ${borderClass} rounded-lg px-3 py-2 text-sm font-medium pr-8 outline-none`}
                                        />
                                        <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-black text-gray-700 uppercase">Description</label>
                                    <button
                                        type="button"
                                        onClick={generateDescription}
                                        className="text-xs font-bold text-brand-cyan hover:text-cyan-700 flex items-center gap-1 transition-colors"
                                    >
                                        <Wand2 size={12} /> AI Generate
                                    </button>
                                </div>
                                <textarea
                                    name="description"
                                    title="Product Description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe your product..."
                                    className={`w-full bg-gray-50 border ${borderClass} rounded-xl px-4 py-3 h-32 resize-none font-medium text-gray-600 outline-none`}
                                />
                            </div>
                        </section>

                        {/* 4. Variants */}
                        {storeTier !== 'HUSTLER' && (
                            <section className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-gray-800 flex items-center gap-2">
                                        <Box size={18} /> Variants
                                    </h4>
                                    <button type="button" onClick={addVariant} className="text-xs font-black text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
                                        + Add Variant
                                    </button>
                                </div>

                                {variants.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm font-medium">
                                        No variants added. This product is sold as a single item.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {variants.map((v) => (
                                            <div key={v.id} className="grid grid-cols-12 gap-3 items-center animate-in slide-in-from-left-2">
                                                <div className="col-span-4">
                                                    <input
                                                        title="Variant Name"
                                                        placeholder="Option Name (e.g. Red, XL)"
                                                        value={v.name}
                                                        onChange={e => updateVariant(v.id, 'name', e.target.value)}
                                                        className="w-full text-sm font-bold border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-cyan border"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        title="Variant Price Override"
                                                        placeholder="Price (Opt)"
                                                        type="number"
                                                        value={v.price}
                                                        onChange={e => updateVariant(v.id, 'price', e.target.value)}
                                                        className="w-full text-sm font-medium border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-cyan border"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        title="Variant Quantity"
                                                        placeholder="Qty"
                                                        type="number"
                                                        value={v.stockQty}
                                                        onChange={e => updateVariant(v.id, 'stockQty', e.target.value)}
                                                        className="w-full text-center text-sm font-medium border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-cyan border"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        title="Variant SKU"
                                                        placeholder="SKU"
                                                        value={v.sku}
                                                        onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                                                        className="w-full text-sm font-medium border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-brand-cyan border"
                                                    />
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <button type="button" title="Remove Variant" aria-label="Remove Variant" onClick={() => removeVariant(v.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                className="w-full bg-brand-cyan hover:bg-cyan-500 text-[#111827] font-black text-lg py-4 rounded-xl shadow-lg shadow-brand-cyan/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            >
                                <Upload size={20} className="stroke-3" />
                                Publish Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* RIGHT: Live Preview */}
            <div className="xl:col-span-1 hidden xl:block">
                <div className="sticky top-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Smartphone size={18} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Live Preview</span>
                    </div>

                    {/* Phone Mockup */}
                    <div className="bg-gray-900 rounded-[3rem] p-4 border-[8px] border-gray-800 shadow-2xl relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-xl z-20" />

                        {/* Screen */}
                        <div className="bg-white rounded-[2rem] overflow-hidden aspect-[9/19] relative flex flex-col">
                            {/* App Bar */}
                            <div className="h-14 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10 flex items-center justify-center pt-4">
                                <span className="text-xs font-black text-black">Product Details</span>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto no-scrollbar flex-1 pb-20">
                                {/* Image Carousel */}
                                <div className="aspect-square bg-gray-100 mb-4 relative">
                                    {mainImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={mainImage} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    {gallery.length > 0 && (
                                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                                            1/{gallery.length + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 space-y-4">
                                    {/* Header */}
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-black text-gray-900 leading-tight">
                                                {name || "Product Name"}
                                            </h3>
                                            <p className="text-lg font-black text-brand-orange">
                                                ₵{price || "0.00"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{category}</p>
                                    </div>

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(t => (
                                                <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg">{t}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="prose prose-sm">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {description || "Product description will appear here..."}
                                        </p>
                                    </div>

                                    {/* Variants Preview */}
                                    {variants.length > 0 && (
                                        <div className="my-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-black text-gray-900 mb-2 uppercase">Options</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variants.map(v => (
                                                    <span key={v.id} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                                                        {v.name} {v.price ? `(+₵${v.price})` : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-100">
                                <button className="w-full bg-black text-white font-black py-3 rounded-xl shadow-lg">
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
