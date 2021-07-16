# Photos

<div class="photo-grid">
    {% for image in site.static_files reversed %}
        {% if image.path contains 'assets/photos' and image.extname == '.webp'%}
        <a href="{{ site.url }}{{ image.path }}">
            <img
                alt=""
                class="lazy photo"
                decoding="sync"
                loading="lazy"
                data-src="{{ site.baseurl }}{{ image.path }}"
                height="567"
                src="assets/thumbs/{{ image.basename }}_100.webp"
                style="display: block; height: auto; width: 100%;"
                width="755"
            />
        </a>
        {% endif %}
    {% endfor %}

</div>

<script>
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
          lazyImage.classList.remove("lazy");
          lazyImage.classList.add("loaded");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to event handlers here
  }
});
</script>
