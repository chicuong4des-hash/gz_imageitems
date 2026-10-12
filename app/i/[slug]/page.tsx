import PublicInvitation from "@/components/PublicInvitation";
export default function Page({ params }: { params: { slug: string } }) { return <PublicInvitation slug={params.slug} />; }
