import { Tag } from "@/components/common/tag"

type TagColor = React.ComponentProps<typeof Tag>["color"]

const palette: NonNullable<TagColor>[] = ["default", "success", "warning", "danger"]

/** Deriva uma cor estável a partir do texto da categoria, para consistência visual sem configuração manual. */
function colorForCategory(label: string): NonNullable<TagColor> {
  let hash = 0
  for (let index = 0; index < label.length; index += 1) {
    hash = (hash + label.charCodeAt(index)) % palette.length
  }
  return palette[hash]
}

interface CategoryBadgeProps
  extends Omit<React.ComponentProps<typeof Tag>, "color" | "children"> {
  category: string
}

/** Badge padronizado para categorias de Ideias — mesma categoria sempre com a mesma cor. */
export function CategoryBadge({ category, ...props }: CategoryBadgeProps) {
  return (
    <Tag color={colorForCategory(category)} {...props}>
      {category}
    </Tag>
  )
}
