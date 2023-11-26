/**
 * Background component.
 */
export default function Background() {
  return (
    <picture className="absolute inset-0 h-full w-full">
      <source srcSet="bg.avif" type="image/avif" />
      <source srcSet="bg.jpg" type="image/jpeg" />
      <img
        src="bg.jpg"
        alt="Description"
        className="h-full w-full object-cover"
      />
    </picture>
  )
}
