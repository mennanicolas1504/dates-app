import { motion } from "framer-motion"
import { Images } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { SearchEmpty } from "@/components/common/search-empty"
import { Typography } from "@/components/common/typography"
import { MemoryCard } from "@/features/album/components/memory-card"
import { groupMemoriesByMonth } from "@/features/album/group-memories"
import type { Memory } from "@/features/album/types"
import { fadeIn, transition } from "@/lib/motion"

interface MemoryGridProps {
  memories: Memory[]
  hasAnyMemories: boolean
  searchQuery: string
  thumbnailUrls: Map<string, string>
  onOpenMemory: (id: string) => void
  onClearFilters: () => void
}

export function MemoryGrid({
  memories,
  hasAnyMemories,
  searchQuery,
  thumbnailUrls,
  onOpenMemory,
  onClearFilters,
}: MemoryGridProps) {
  if (!hasAnyMemories) {
    return (
      <EmptyState
        icon={Images}
        title="Nenhuma memória ainda"
        description="Quando uma experiência for marcada como vivida, ela aparece aqui — com fotos, avaliação e tudo que vocês registraram."
      />
    )
  }

  if (memories.length === 0) {
    return searchQuery ? (
      <SearchEmpty query={searchQuery} onClear={onClearFilters} />
    ) : (
      <EmptyState
        icon={Images}
        title="Nada por aqui com esse filtro"
        description="Tente outro filtro para ver mais memórias."
      />
    )
  }

  const years = groupMemoriesByMonth(memories)

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={transition}
      className="flex flex-col gap-8"
    >
      {years.map((yearGroup) => (
        <div key={yearGroup.year} className="flex flex-col gap-6">
          <Typography variant="heading">{yearGroup.year}</Typography>

          {yearGroup.months.map((monthGroup) => (
            <div key={monthGroup.key} className="flex flex-col gap-3">
              <Typography variant="label" className="capitalize">
                {monthGroup.label}
              </Typography>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {monthGroup.memories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    thumbnailUrl={thumbnailUrls.get(memory.id)}
                    onOpen={() => onOpenMemory(memory.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  )
}
