"use-client";

import { Copy as CopyIcon, Server as ServerIcon } from "lucide-react";
import { toast } from "react-hot-toast";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
  variant: "public" | "admin";
}

const textMap: Record<Props["variant"], string> = {
  public: "Public",
  admin: "Admin",
};

const variantMap: Record<Props["variant"], BadgeProps["variant"]> = {
  public: "secondary",
  admin: "destructive",
};

export const ApiAlert = ({ title, description, variant = "public" }: Props) => {
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("API Route copied to clipboard.");
  };

  return (
    <Alert>
      <AlertTitle className="flex items-center gap-x-2">
        <ServerIcon className="h-4 w-4" />
        {title}
        <Badge variant={variantMap[variant]}>
          {textMap[variant]}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-accent px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};
