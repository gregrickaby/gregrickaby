# Photos

<div>
    {% for image in site.static_files %}
        {% if image.path contains 'assets/photos' %}
        <picture>
            <source type="image/avif" srcSet="{{ site.baseurl }}{{ image.path }}" />
            <source type="image/webp" srcSet="{{ site.baseurl }}{{ image.path }}" />
            <img
            alt=""
            decoding="async"
            height="722"
            loading="lazy"
            src="{{ site.baseurl }}{{ image.path }}"
            width="962"
            />
        </picture>
        {% endif %}
{% endfor %}
</div>
