import { useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PageContainer } from "@/components/common/page-container"
import { PageTitle } from "@/components/common/page-title"
import { SkeletonList } from "@/components/common/skeletons"
import { Typography } from "@/components/common/typography"
import {
  cancelExperiencePlan,
  createExperience,
  deleteExperience,
  fetchExperiencesForSpace,
  planExperience,
  updateExperienceDetails,
  updateExperienceFavorite,
} from "@/features/ideias/api"
import { IDEA_CATEGORIES } from "@/features/ideias/data/categories"
import { IdeaDetailsSheet } from "@/features/ideias/components/idea-details-sheet"
import { IdeasList } from "@/features/ideias/components/ideas-list"
import { IdeasToolbar, type IdeasSortOption } from "@/features/ideias/components/ideas-toolbar"
import { NewIdeaDialog } from "@/features/ideias/components/new-idea-dialog"
import { PlanDialog, type PlanConfirmValues } from "@/features/ideias/components/plan-dialog"
import { SuggestionsDialog } from "@/features/ideias/components/suggestions-dialog"
import type { Idea, NewIdeaFormValues } from "@/features/ideias/types"
import { toast } from "@/hooks/use-toast"
import { useSignedMediaUrls } from "@/hooks/use-signed-media-urls"
import { listMedia, listMediaForResources } from "@/lib/media/api"
import type { MediaRecord } from "@/lib/media/types"
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
  }
}

export function IdeiasPage() {
  const { space, user } = useAuth()

  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  // Mesmo sentinel de 3 estados do `AuthProvider` para `space`: reseta
  // `loading`/`ideas` em render (não em efeito) sempre que o espaço muda de
  // identidade, para não chamar setState síncrono dentro do efeito abaixo.
  const [loadedSpaceId, setLoadedSpaceId] = useState<string | null | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<IdeasSortOption>("recent")

  const [newIdeaOpen, setNewIdeaOpen] = useState(false)
  const [submittingIdea, setSubmittingIdea] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [prefill, setPrefill] = useState<Partial<NewIdeaFormValues>>()
  const [editingId, setEditingId] = useState<string | null>(null)
  // Fotos da ideia atualmente aberta no diálogo (criação ou edição) — ver
  // `NewIdeaDialog`, que só consome o Sistema de Mídia, nunca duplica a
  // lógica dele.
  const [dialogMedia, setDialogMedia] = useState<MediaRecord[]>([])

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsIdea, setDetailsIdea] = useState<Idea | null>(null)

  const [planTarget, setPlanTarget] = useState<Idea | null>(null)
  const [planning, setPlanning] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Idea | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Ids com alguma ação assíncrona em voo (favoritar/cancelar planejamento/
  // excluir) — desabilita as ações da linha correspondente enquanto isso.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  // Primeira foto de cada ideia, para a miniatura na lista — uma consulta
  // em lote (`listMediaForResources`), não uma por linha.
  const [thumbnails, setThumbnails] = useState<Map<string, MediaRecord>>(new Map())
  const thumbnailMedia = useMemo(() => Array.from(thumbnails.values()), [thumbnails])
  const { urls: thumbnailMediaUrls } = useSignedMediaUrls(thumbnailMedia)
  const thumbnailUrls = useMemo(() => {
    const map = new Map<string, string>()
    for (const [ideaId, media] of thumbnails) {
      const url = thumbnailMediaUrls.get(media.id)
      if (url) map.set(ideaId, url)
    }
    return map
  }, [thumbnails, thumbnailMediaUrls])

  function markPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function refreshThumbnail(ideaId: string) {
    const { media } = await listMedia("idea", ideaId)
    setThumbnails((prev) => {
      const next = new Map(prev)
      if (media[0]) next.set(ideaId, media[0])
      else next.delete(ideaId)
      return next
    })
  }

  const spaceId = space?.id ?? null
  if (spaceId !== loadedSpaceId) {
    setLoadedSpaceId(spaceId)
    setLoading(spaceId !== null)
    setIdeas([])
  }

  // Mesmo padrão de `AuthProvider` para carregar `space`: useEffect + flag
  // `cancelled`, sem biblioteca de data-fetching (não existe uma no projeto).
  useEffect(() => {
    if (!space) return

    let cancelled = false

    fetchExperiencesForSpace(space.id).then(async ({ experiences, error }) => {
      if (cancelled) return
      if (error) {
        toast.error({ title: "Não foi possível carregar as ideias", description: error })
        setLoading(false)
        return
      }

      setIdeas(experiences)
      setLoading(false)

      if (experiences.length > 0) {
        const { media } = await listMediaForResources(
          "idea",
          experiences.map((idea) => idea.id),
        )
        if (cancelled) return

        const firstByIdea = new Map<string, MediaRecord>()
        for (const item of media) {
          if (!firstByIdea.has(item.resourceId)) firstByIdea.set(item.resourceId, item)
        }
        setThumbnails(firstByIdea)
      }
    })

    return () => {
      cancelled = true
    }
  }, [space, spaceId])

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

  const handleToggleFavorite = async (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return

    const nextFavorite = !idea.favorite
    markPending(id, true)
    const { error } = await updateExperienceFavorite(id, nextFavorite)
    markPending(id, false)

    if (error) {
      toast.error({ title: "Não foi possível atualizar o favorito", description: error })
      return
    }

    setIdeas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: nextFavorite } : item)),
    )
  }

  const handleClearFilters = () => {
    setSearch("")
    setCategory("all")
  }

  const handleOpenNewIdea = () => {
    setEditingId(null)
    setPrefill(undefined)
    setDialogMedia([])
    setNewIdeaOpen(true)
  }

  const handleOpenEdit = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return
    setEditingId(id)
    setPrefill(ideaToFormValues(idea))
    setDialogMedia([])
    setNewIdeaOpen(true)
    listMedia("idea", id).then(({ media }) => setDialogMedia(media))
  }

  // Fecha o diálogo e atualiza a miniatura da lista com o que ficou salvo
  // (a lista não precisa saber, em tempo real, do que muda enquanto o
  // diálogo está aberto por cima dela).
  const handleDialogOpenChange = (open: boolean) => {
    if (submittingIdea) return
    if (!open && editingId) refreshThumbnail(editingId)
    setNewIdeaOpen(open)
  }

  const handleSelectSuggestion = (suggestion: { title: string; category: string }) => {
    setEditingId(null)
    setPrefill(suggestion)
    setDialogMedia([])
    setSuggestionsOpen(false)
    setNewIdeaOpen(true)
  }

  const handleSubmitIdea = async (values: NewIdeaFormValues) => {
    if (!space || !user) return

    const trimmed: NewIdeaFormValues = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      instagram: values.instagram.trim(),
      website: values.website.trim(),
      link: values.link.trim(),
      city: values.city.trim(),
      notes: values.notes.trim(),
    }

    setSubmittingIdea(true)

    if (editingId) {
      const { error } = await updateExperienceDetails(editingId, trimmed)
      setSubmittingIdea(false)

      if (error) {
        toast.error({ title: "Não foi possível salvar as alterações", description: error })
        return
      }

      setIdeas((prev) =>
        prev.map((idea) => (idea.id === editingId ? { ...idea, ...trimmed } : idea)),
      )
      toast.success({ title: "Ideia atualizada" })
      return
    }

    const { experience, error } = await createExperience({
      spaceId: space.id,
      createdById: user.id,
      createdByName: user.email?.split("@")[0] ?? "Você",
      values: trimmed,
    })
    setSubmittingIdea(false)

    if (error || !experience) {
      toast.error({
        title: "Não foi possível criar a ideia",
        description: error ?? undefined,
      })
      return
    }

    setIdeas((prev) => [experience, ...prev])
    toast.success({ title: "Ideia criada" })
    // Não fecha o diálogo: agora que a ideia existe de verdade, a seção de
    // fotos libera (ver `NewIdeaDialog`, prop `resourceId`) — o usuário
    // decide quando fechar.
    setEditingId(experience.id)
  }

  const handleMediaUploaded = (media: MediaRecord) => {
    setDialogMedia((prev) => [...prev, media].sort((a, b) => a.position - b.position))
  }

  const handleMediaRemoved = (mediaId: string) => {
    setDialogMedia((prev) => prev.filter((item) => item.id !== mediaId))
  }

  const handleMediaReordered = (updates: { id: string; position: number }[]) => {
    setDialogMedia((prev) => {
      const next = prev.map((item) => {
        const update = updates.find((entry) => entry.id === item.id)
        return update ? { ...item, position: update.position } : item
      })
      return next.sort((a, b) => a.position - b.position)
    })
  }

  const handleOpenDetails = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return
    setDetailsIdea(idea)
    setDetailsOpen(true)
  }

  const handleRequestPlan = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (idea) setPlanTarget(idea)
  }

  const handleConfirmPlan = async (values: PlanConfirmValues) => {
    if (!planTarget) return
    const id = planTarget.id
    const wasAlreadyPlanned = planTarget.status === "scheduled"
    const scheduledDate = values.scheduledDate.toISOString()

    setPlanning(true)
    const { error } = await planExperience(id, {
      scheduledDate,
      location: values.location,
      notes: values.notes,
    })
    setPlanning(false)

    if (error) {
      toast.error({ title: "Não foi possível planejar", description: error })
      return
    }

    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              status: "scheduled",
              scheduledDate,
              location: values.location || undefined,
              notes: values.notes || undefined,
            }
          : idea,
      ),
    )
    toast.success({ title: wasAlreadyPlanned ? "Planejamento atualizado" : "Ideia planejada" })
    setPlanTarget(null)
  }

  const handleCancelPlan = async (id: string) => {
    markPending(id, true)
    const { error } = await cancelExperiencePlan(id)
    markPending(id, false)

    if (error) {
      toast.error({ title: "Não foi possível cancelar o planejamento", description: error })
      return
    }

    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, status: "idea", scheduledDate: undefined } : idea,
      ),
    )
    toast.success({ title: "Planejamento cancelado" })
  }

  const handleRequestDelete = (id: string) => {
    const idea = ideas.find((item) => item.id === id)
    if (idea) setDeleteTarget(idea)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id

    setDeleting(true)
    const { error } = await deleteExperience(id)
    setDeleting(false)

    if (error) {
      toast.error({ title: "Não foi possível excluir a ideia", description: error })
      return
    }

    setIdeas((prev) => prev.filter((idea) => idea.id !== id))
    setThumbnails((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    toast.success({ title: "Ideia excluída" })
    setDeleteTarget(null)
  }

  if (!space || !user) return null

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

      {loading ? (
        <SkeletonList rows={5} />
      ) : (
        <IdeasList
          ideas={filteredIdeas}
          hasAnyIdeas={ideas.length > 0}
          searchQuery={search}
          onClearFilters={handleClearFilters}
          onCreateFirst={handleOpenNewIdea}
          onOpenSuggestions={() => setSuggestionsOpen(true)}
          onToggleFavorite={handleToggleFavorite}
          onOpenDetails={handleOpenDetails}
          onPlan={handleRequestPlan}
          onCancelPlan={handleCancelPlan}
          onEdit={handleOpenEdit}
          onDelete={handleRequestDelete}
          pendingIds={pendingIds}
          thumbnailUrls={thumbnailUrls}
        />
      )}

      <NewIdeaDialog
        open={newIdeaOpen}
        onOpenChange={handleDialogOpenChange}
        initialValues={prefill}
        onSubmit={handleSubmitIdea}
        mode={editingId ? "edit" : "create"}
        submitting={submittingIdea}
        spaceId={space.id}
        createdById={user.id}
        resourceId={editingId}
        media={dialogMedia}
        onMediaUploaded={handleMediaUploaded}
        onMediaRemoved={handleMediaRemoved}
        onMediaReordered={handleMediaReordered}
      />

      <SuggestionsDialog
        open={suggestionsOpen}
        onOpenChange={setSuggestionsOpen}
        onSelect={handleSelectSuggestion}
      />

      <IdeaDetailsSheet idea={detailsIdea} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <PlanDialog
        idea={planTarget}
        open={planTarget !== null}
        onOpenChange={(open) => !open && !planning && setPlanTarget(null)}
        onConfirm={handleConfirmPlan}
        submitting={planning}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}
        title="Excluir ideia"
        description={
          deleteTarget ? `"${deleteTarget.title}" será removida permanentemente.` : undefined
        }
        icon={Trash2}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </PageContainer>
  )
}
