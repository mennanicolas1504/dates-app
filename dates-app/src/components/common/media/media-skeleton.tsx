import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MediaSkeletonProps {
  count?: number
  className?: string
}

/** Placeholder de carregamento para `MediaPreviewGrid` — mesma grade, sem os dados. */
export function MediaSkeleton({ count = 4, className }: MediaSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}
