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
                    height="722"
                    loading="lazy"
                    src="{{ site.baseurl }}{{ image.path }}"
                    width="962"
                />
            </picture>
        </a>
        {% endif %}
{% endfor %}
</div>
