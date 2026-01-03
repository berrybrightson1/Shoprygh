import { redirect } from "next/navigation";

export default async function AdminRootRedirect({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    redirect(`/${storeSlug}/admin/inventory`);
}
