/**
 * Background component.
 */
export default function Background() {
  return (
    <picture className="absolute inset-0 h-full w-full">
      <source srcSet="/bg_hdr.avif" type="image/avif" />
      <source srcSet="/bg_hdr.jpg" type="image/jpeg" />
      <img
        alt=""
        className="h-full w-full object-cover"
        loading="eager"
        src="/bg_hdr.jpg"
      />
    </picture>
  )
}
