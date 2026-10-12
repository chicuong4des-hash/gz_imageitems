import Editor from "@/components/Editor";
export default function Page({ params }: { params: { id: string } }) { return <Editor id={params.id} />; }
