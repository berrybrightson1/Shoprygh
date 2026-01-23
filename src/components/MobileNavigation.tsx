import MobileTabs from "./MobileTabs";

interface MobileNavigationProps {
    storeSlug: string;
}

export default function MobileNavigation({ storeSlug }: MobileNavigationProps) {
    return (
        <>
            <MobileTabs storeSlug={storeSlug} />
        </>
    );
}
