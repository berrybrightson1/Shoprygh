import { Store, Ban, Trash2, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { suspendStore, unsuspendStore, impersonateStoreOwner, updateStoreTierManually } from "./actions";
import { deleteStore as deleteStoreAction } from "../actions/platform";

interface StoreActionsProps {
    store: {
        id: string;
        slug: string;
        name: string;
        status: "ACTIVE" | "SUSPENDED" | "DELETED";
        tier: string;
    };
}

import { useRouter } from "next/navigation";

export default function StoreActions({ store }: StoreActionsProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteStoreAction(store.id);
            toast.success("Store deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete store");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="flex gap-2 items-center">
            {/* Tier Selector */}
            <form action={async (formData) => {
                await updateStoreTierManually(formData);
                toast.success("Store tier updated");
            }} className="mr-2">
                <input type="hidden" name="storeId" value={store.id} />
                <select
                    name="tier"
                    defaultValue={store.tier}
                    onChange={(e) => e.target.form?.requestSubmit()}
                    aria-label="Store Tier"
                    className="text-xs font-bold uppercase text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition shadow-sm"
                >
                    <option value="HUSTLER" className="text-gray-900 bg-white">Hustler</option>
                    <option value="PRO" className="text-gray-900 bg-white">Pro</option>
                    <option value="WHOLESALER" className="text-gray-900 bg-white">Wholesaler</option>
                </select>
            </form>

            <Link
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Visit Store"
            >
                <Store size={18} />
            </Link>

            {/* Impersonation Button */}
            <form action={impersonateStoreOwner}>
                <input type="hidden" name="storeId" value={store.id} />
                <button
                    type="submit"
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Login As Owner"
                >
                    <User size={18} />
                </button>
            </form>

            {store.status === "ACTIVE" ? (
                <form action={suspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Suspend Store"
                    >
                        <Ban size={18} />
                    </button>
                </form>
            ) : (
                <form action={unsuspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Unsuspend Store"
                    >
                        <CheckCircle size={18} />
                    </button>
                </form>
            )}

            <button
                type="button"
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                title="Delete Store"
                onClick={() => setIsDeleteModalOpen(true)}
            >
                <Trash2 size={18} />
            </button>

            <DeleteConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={`Delete ${store.name}?`}
                message="Are you sure you want to completely remove this store? This action cannot be undone and will delete all products, orders, and data associated with it."
                confirmLabel="Delete Store"
                isLoading={isDeleting}
            />
        </div>
    );
}
