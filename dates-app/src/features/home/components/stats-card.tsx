import { motion } from "framer-motion"
import { CalendarClock, Images, Lightbulb, Star } from "lucide-react"

import { SectionTitle } from "@/components/common/section-title"
import { StatCard } from "@/components/common/stat-card"
import type { HomeStats } from "@/features/home/select-highlights"
import { fadeIn, transition } from "@/lib/motion"

interface StatsCardProps {
  stats: HomeStats
}

/** Card 5 — resumo do espaço, só contagens sobre os dados já buscados (ver `computeHomeStats`). Nenhuma tabela nova. */
export function StatsCard({ stats }: StatsCardProps) {
  return (
    <motion.div initial="initial" animate="animate" variants={fadeIn} transition={transition} className="flex flex-col gap-2">
      <SectionTitle as="h2" className="text-sm">
        Resumo
      </SectionTitle>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Ideias" value={stats.ideas} icon={Lightbulb} />
        <StatCard label="Planejados" value={stats.planned} icon={CalendarClock} />
        <StatCard label="Memórias" value={stats.memories} icon={Images} />
        <StatCard label="Favoritos" value={stats.favorites} icon={Star} />
      </div>
    </motion.div>
  )
}
