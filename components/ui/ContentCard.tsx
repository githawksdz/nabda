import type { ComponentProps } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { cn } from "@/lib/utils";

type ContentCardProps = ComponentProps<typeof Card> & {
  tone?: "default" | "inverse";
};

export function ContentCard({
  tone = "default",
  className,
  ...props
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        tone === "inverse" &&
          "bg-primary text-primary-foreground ring-transparent",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
