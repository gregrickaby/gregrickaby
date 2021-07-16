# Photos

<div class="photo-grid">
    {% for image in site.static_files reversed %}
        {% if image.path contains 'assets/photos' and image.extname == '.jpg' %}
        <a href="{{ site.url }}{{ image.path }}">
            <img
                alt=""
                class="lazy photo"
                decoding="sync"
                loading="lazy"
                data-src="assets/photos/thumbs/{{ image.basename }}_100.webp"
                data-srcset="assets/photos/mobile/{{ image.basename }}_400.webp 400w, assets/photos/tablet/{{ image.basename }}_755.webp 768w,"
                height="567"
                sizes="(max-width: 600px) 400px, 768px"
                src="assets/photos/thumbs/{{ image.basename }}_100.webp"
                style="display: block; height: auto; width: 100%;"
                width="755"
            />
        </a>
        {% endif %}
    {% endfor %}
</div>

<script async>
  document.addEventListener("DOMContentLoaded", function () {
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImage.classList.add("loaded");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
});
</script>
