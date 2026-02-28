import { Metadata } from 'next';
import { getStateBySlug, getAllStateSlugs } from '../stateData';
import { stateSeoDataMap } from '../stateSeoData';

interface Props {
    params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
    return getAllStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { state: stateSlug } = await params;
    const stateData = getStateBySlug(stateSlug);

    if (!stateData) {
        return { title: 'State Not Found' };
    }

    const seoData = stateSeoDataMap[stateSlug];

    // Use enriched keywords if available, otherwise fall back to generic
    const keywords = seoData
        ? seoData.keywords
        : [
            `online community service hours ${stateData.name}`,
            `court-approved community service ${stateData.name}`,
            `community service online ${stateData.name}`,
            `probation community service ${stateData.name}`,
            `${stateData.name} community service program`,
        ];

    // Vary the meta description hook
    const metaHook = seoData?.metaHook || 'Start today';
    const descriptionSuffix = `${metaHook}.`;

    return {
        title: `Online Community Service Hours in ${stateData.name} | The Foundation of Change`,
        description: `Complete court-approved community service hours online in ${stateData.name}. 501(c)(3) nonprofit program accepted by ${stateData.name} courts and probation departments. ${descriptionSuffix}`,
        keywords,
        alternates: {
            canonical: `https://thefoundationofchange.org/states/${stateSlug}`,
        },
        openGraph: {
            title: `Complete Community Service Hours in ${stateData.name} — 100% Online | ${metaHook}`,
            description: `A verified 501(c)(3) nonprofit program accepted by ${stateData.name} courts and probation officers. ${descriptionSuffix}`,
            type: 'website',
        },
    };
}

export default function StateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
