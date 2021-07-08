# Photos

<div class="photo-grid">
    {% for image in site.static_files reversed %}
        {% if image.path contains 'assets/photos' and image.extname == '.jpg' %}
        <a href="{{ site.url }}{{ image.path }}">
            <picture>
                <source type="image/avif" srcset="{{ site.baseurl }}/assets/photos/{{ image.basename }}.avif" />
                <source type="image/webp" srcset="{{ site.baseurl }}/assets/photos/{{ image.basename }}.webp" />
                <img
                    alt=""
                    class="photo"
                    decoding="async"
                    loading="lazy"
                    style="max-width: 722px;"
                    src="{{ site.baseurl }}{{ image.path }}"
                />
            </picture>
        </a>
        {% endif %}
{% endfor %}
</div>
