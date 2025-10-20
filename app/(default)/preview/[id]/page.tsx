export default async function PreviewPage(
  props: Readonly<{params: Promise<{id: string}>}>
) {
  const params = await props.params
  return <div>Preview ID: {params.id}</div>
}
