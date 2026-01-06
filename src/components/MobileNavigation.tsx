"use client";

import MobileBottomNav from "./MobileBottomNav";
import MobileTabs from "./MobileTabs";

interface MobileNavigationProps {
    storeSlug: string;
}

export default function MobileNavigation({ storeSlug }: MobileNavigationProps) {
    return (
        <>
            <MobileBottomNav storeSlug={storeSlug} />
            <MobileTabs storeSlug={storeSlug} />
        </>
    );
}
