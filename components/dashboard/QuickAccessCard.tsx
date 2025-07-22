import { Link } from "wouter";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  bgColorClass: string;
  iconColorClass: string;
  description?: string;
}

export function QuickAccessCard({
  href,
  icon: Icon,
  title,
  bgColorClass,
  iconColorClass,
  description,
}: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className={cn("p-3 rounded-lg", bgColorClass)}>
              <Icon className={cn("h-6 w-6", iconColorClass)} />
            </div>
            <h3 className="font-medium text-sm">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}