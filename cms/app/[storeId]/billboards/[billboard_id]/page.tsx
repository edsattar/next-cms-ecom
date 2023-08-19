import prismadb from "@/lib/prismadb";

import { BillboardForm } from "./components/BillboardForm";

interface Props {
    params: { billboard_id: string };
}

const BillboardPage = async ({ params }: Props) => {
    const billboards = await prismadb.billboard.findUnique({
        where: {
            id: params.billboard_id,
        },
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardForm initialData={billboards} />
            </div>
        </div>
    );
};

export default BillboardPage;
