"use client";

import axios from "axios";
import { useState, FC } from "react";
import {
    Copy,
    Edit,
    MoreHorizontal,
    Trash,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

import { BillboardColumnsType } from "./BillboardColumns";

interface Props {
    data: BillboardColumnsType;
}

export const CellActions = ({ data }: Props) => {
    const router = useRouter();
    const params = useParams();
    const [openDialog, setOpenDialog] = useState(false);
    const [loadingDialog, setLoadingDialog] =
        useState(false);

    const onConfirm = async () => {
        try {
            setLoadingDialog(true);
            await axios.delete(
                `/api/${params.storeId}/billboards/${data.id}`
            );
            toast.success("Billboard deleted.");
            router.refresh();
        } catch (error) {
            toast.error(
                "Make sure you removed all categories using this billboard first."
            );
        } finally {
            setOpenDialog(false);
            setLoadingDialog(false);
        }
    };

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Billboard ID copied to clipboard.");
    };

    return (
        <>
            <AlertModal
                isOpen={openDialog}
                onClose={() => setOpenDialog(false)}
                onConfirm={onConfirm}
                loading={loadingDialog}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                    >
                        <span className="sr-only">
                            Open menu
                        </span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => onCopy(data.id)}
                    >
                        <Copy className="mr-2 h-4 w-4" />{" "}
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            router.push(
                                `/${params.storeId}/billboards/${data.id}`
                            )
                        }
                    >
                        <Edit className="mr-2 h-4 w-4" />{" "}
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpenDialog(true)}
                    >
                        <Trash className="mr-2 h-4 w-4" />{" "}
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
