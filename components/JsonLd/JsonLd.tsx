import {serializeSchema, type SchemaGraph} from '@/lib/schema'

/**
 * Props for the JsonLd component.
 *
 * @interface
 */
interface JsonLdProps {
  /** The schema graph to embed as JSON-LD. */
  graph: SchemaGraph
}

/**
 * Renders a JSON-LD `<script>` tag from a schema graph, safely serialized
 * for `dangerouslySetInnerHTML`.
 *
 * @param props - The props for the JsonLd component.
 * @returns A React element with the JSON-LD script tag.
 */
export function JsonLd({graph}: Readonly<JsonLdProps>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: serializeSchema(graph)}}
    />
  )
}
