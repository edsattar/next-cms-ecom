"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui-c/data-table";
import { Heading } from "@/components/ui-c/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui-c/api-list";

import {
    BillboardColumns,
    BillboardColumnsType,
} from "./BillboardColumns";

interface Props {
    data: BillboardColumnsType[];
}

export const BillboardClient = ({ data }: Props) => {
    const params = useParams();
    const router = useRouter();

    return (
        <>
            <div className="flex items-center justify-between">
                <Heading
                    title={`Billboards (${data.length})`}
                    description="Manage billboards for your store"
                />
                <Button
                    onClick={() =>
                        router.push(
                            `/${params.storeId}/billboards/new`
                        )
                    }
                >
                    <Plus className="mr-2 h-4 w-4" /> Add
                    New
                </Button>
            </div>
            <Separator />
            <DataTable
                filterKey="label"
                columns={BillboardColumns}
                data={data}
            />
            <Heading
                title="API"
                description="API Calls for Billboards"
            />
            <Separator />
            <ApiList
                entityName="billboards"
                entityIdName="billboardId"
            />
        </>
    );
};
