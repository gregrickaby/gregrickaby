# Photos

<div>
    {% for image in site.static_files reversed %}
        {% if image.path contains 'assets/photos' and image.extname == '.jpg' %}
        <a href="{{ site.url }}{{ image.path }}">
            <picture>
                <source type="image/avif" srcSet="{{ site.baseurl }}/assets/photos/{{ image.basename }}.avif" />
                <source type="image/webp" srcSet="{{ site.baseurl }}/assets/photos/{{ image.basename }}.webp" />
                <img
                    alt=""
                    decoding="async"
                    loading="lazy"
                    src="{{ site.baseurl }}{{ image.path }}"
                />
            </picture>
        </a>
        {% endif %}
{% endfor %}
</div>
