// src/components/financeiro/FinanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface FinanceCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  tooltipText: string;
  trend?: "positive" | "negative";
  isCurrency?: boolean;
  blur?: boolean;
}

export const FinanceCard = ({
  title,
  value,
  icon: Icon,
  tooltipText,
  trend,
  isCurrency = true,
  blur = false,
}: FinanceCardProps) => {
  const formattedValue = isCurrency
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value)
    : value.toString();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                blur && "blur-sm"
              )}
            >
              {formattedValue}
            </div>
            {trend && (
              <p className="text-xs text-muted-foreground flex items-center">
                {trend === "positive" ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn("font-semibold", trend === "positive" ? "text-green-500" : "text-red-500")}>
                  {/* Trend percentage can be added here */}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
