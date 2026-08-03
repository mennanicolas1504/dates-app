import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { Typography } from "@/components/common/typography"
import { IDEA_CATEGORIES } from "@/features/ideias/data/categories"
import { IdeaDetailsSheet } from "@/features/ideias/components/idea-details-sheet"
import { IdeasList } from "@/features/ideias/components/ideas-list"
import { IdeasToolbar, type IdeasSortOption } from "@/features/ideias/components/ideas-toolbar"
import { NewIdeaDialog } from "@/features/ideias/components/new-idea-dialog"
import { ScheduleDialog } from "@/features/ideias/components/schedule-dialog"
import { SuggestionsDialog } from "@/features/ideias/components/suggestions-dialog"
import type { Idea, NewIdeaFormValues } from "@/features/ideias/types"
import { useAuth } from "@/providers/auth-provider"

function ideaToFormValues(idea: Idea): NewIdeaFormValues {
  return {
    title: idea.title,
    category: idea.category,
    description: idea.description ?? "",
    location: idea.location ?? "",
    instagram: idea.instagram ?? "",
    website: idea.website ?? "",
    link: idea.link ?? "",
    city: idea.city ?? "",
    notes: idea.notes ?? "",
    images: idea.images,
  }
}

export function IdeiasPage() {
  const { space, user } = useAuth()

  // Sem dados mockados por padrão: o usuário só vê ideias que ele mesmo
  // criou nesta sessão (em memória, sem persistência nesta fase).
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<IdeasSortOption>("recent")

  const [newIdeaOpen, setNewIdeaOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [prefill, setPrefill] = useState<Partial<NewIdeaFormValues>>()
  const [editingId, setEditingId] = useState<string | null>(null)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsIdea, setDetailsIdea] = useState<Idea | null>(null)

  const [scheduleTarget, setScheduleTarget] = useState<Idea | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Idea | null>(null)

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = ideas.filter((idea) => {
      const matchesQuery = query.length === 0 || idea.title.toLowerCase().includes(query)
      const matchesCategory = category === "all" || idea.category === category
      return matchesQuery && matchesCategory
    })

    return [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "pt-BR")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [ideas, search, category, sort])

  const handleToggleFavorite = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, favorite: !idea.favorite } : idea)),
    )
  }

  const handleClearFilters = () => {
    setSearch("")
    setCategory("all")
  }

  const handleOpenNewIdea = () => {
    setEditingId(null)
    setPrefill(undefined)
    setNewIdeaOpen(true)
  }

  const handleOpenEdit = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return
    setEditingId(id)
    setPrefill(ideaToFormValues(idea))
    setNewIdeaOpen(true)
  }

  const handleSelectSuggestion = (suggestion: { title: string; category: string }) => {
    setEditingId(null)
    setPrefill(suggestion)
    setSuggestionsOpen(false)
    setNewIdeaOpen(true)
  }

  const handleSubmitIdea = (values: NewIdeaFormValues) => {
    const fields = {
      title: values.title.trim(),
      category: values.category,
      images: values.images,
      description: values.description.trim() || undefined,
      location: values.location.trim() || undefined,
      instagram: values.instagram.trim() || undefined,
      website: values.website.trim() || undefined,
      link: values.link.trim() || undefined,
      city: values.city.trim() || undefined,
      notes: values.notes.trim() || undefined,
    }

    if (editingId) {
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === editingId ? { ...idea, ...fields } : idea)),
      )
      setEditingId(null)
      return
    }

    const newIdea: Idea = {
      id: crypto.randomUUID(),
      spaceId: space?.id ?? "",
      status: "idea",
      favorite: false,
      createdBy: user?.email?.split("@")[0] ?? "Você",
      createdAt: new Date().toISOString(),
      ...fields,
    }
    setIdeas((prev) => [newIdea, ...prev])
  }

  const handleOpenDetails = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return
    setDetailsIdea(idea)
    setDetailsOpen(true)
  }

  const handleRequestSchedule = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (idea) setScheduleTarget(idea)
  }

  const handleConfirmSchedule = (date: Date) => {
    if (!scheduleTarget) return
    const id = scheduleTarget.id
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? { ...idea, status: "scheduled", scheduledDate: date.toISOString() }
          : idea,
      ),
    )
    setScheduleTarget(null)
  }

  const handleRequestDelete = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (idea) setDeleteTarget(idea)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setIdeas((prev) => prev.filter((idea) => idea.id !== id))
    setDeleteTarget(null)
  }

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <PageTitle>Ideias</PageTitle>
        <Typography variant="subtitle">
          Capture, organize e planeje as próximas experiências a dois.
        </Typography>
      </div>

      <IdeasToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={IDEA_CATEGORIES}
        sort={sort}
        onSortChange={setSort}
        onCreate={handleOpenNewIdea}
        onSuggestions={() => setSuggestionsOpen(true)}
      />

      <IdeasList
        ideas={filteredIdeas}
        hasAnyIdeas={ideas.length > 0}
        searchQuery={search}
        onClearFilters={handleClearFilters}
        onCreateFirst={handleOpenNewIdea}
        onOpenSuggestions={() => setSuggestionsOpen(true)}
        onToggleFavorite={handleToggleFavorite}
        onOpenDetails={handleOpenDetails}
        onSchedule={handleRequestSchedule}
        onEdit={handleOpenEdit}
        onDelete={handleRequestDelete}
      />

      <NewIdeaDialog
        open={newIdeaOpen}
        onOpenChange={setNewIdeaOpen}
        initialValues={prefill}
        onSubmit={handleSubmitIdea}
        mode={editingId ? "edit" : "create"}
      />

      <SuggestionsDialog
        open={suggestionsOpen}
        onOpenChange={setSuggestionsOpen}
        onSelect={handleSelectSuggestion}
      />

      <IdeaDetailsSheet idea={detailsIdea} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <ScheduleDialog
        idea={scheduleTarget}
        open={scheduleTarget !== null}
        onOpenChange={(open) => !open && setScheduleTarget(null)}
        onConfirm={handleConfirmSchedule}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir ideia"
        description={
          deleteTarget ? `"${deleteTarget.title}" será removida permanentemente.` : undefined
        }
        icon={Trash2}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  )
}
