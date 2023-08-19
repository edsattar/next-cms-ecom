"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellActions } from "./CellActions";

export type BillboardColumnsType = {
    id: string;
    label: string;
    createdAt: string;
};

export const BillboardColumns: ColumnDef<BillboardColumnsType>[] =
    [
        {
            accessorKey: "label",
            header: "Label",
        },
        {
            accessorKey: "createdAt",
            header: "Date",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <CellActions data={row.original} />
            ),
        },
    ];
