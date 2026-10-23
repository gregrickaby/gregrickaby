import { serializeSchema, type SchemaGraph } from '@/lib/schema'

/** A JSON-LD `<script>`, escaped by `serializeSchema` so it can't close the tag. */
export function JsonLd({ graph }: { graph: SchemaGraph }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeSchema(graph) }}
      type="application/ld+json"
    />
  )
}
