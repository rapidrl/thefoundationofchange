import { Metadata } from 'next';
import { getStateBySlug, getAllStateSlugs } from '../stateData';

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

    return {
        title: `Online Community Service Hours in ${stateData.name} | The Foundation of Change`,
        description: `Complete court-approved community service hours online in ${stateData.name}. 501(c)(3) nonprofit program accepted by ${stateData.name} courts and probation departments. Start today.`,
        keywords: [
            `online community service hours ${stateData.name}`,
            `court-approved community service ${stateData.name}`,
            `community service online ${stateData.name}`,
            `probation community service ${stateData.name}`,
            `${stateData.name} community service program`,
        ],
        openGraph: {
            title: `Complete Community Service Hours in ${stateData.name} — 100% Online`,
            description: `A verified 501(c)(3) nonprofit program accepted by ${stateData.name} courts and probation officers. Start from home.`,
            type: 'website',
        },
    };
}

export default function StateLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
