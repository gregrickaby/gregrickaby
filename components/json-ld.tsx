import { serializeSchema, type SchemaGraph } from '@/lib/schema'

/** A JSON-LD `<script>`, escaped by `serializeSchema` so it can't close the tag. */
export function JsonLd({ graph }: { graph: SchemaGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeSchema(graph) }}
    />
  )
}
