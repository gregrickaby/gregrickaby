# Photos

<div>
    {% for image in site.static_files %}
        {% if image.path contains 'assets/photos' %}
        <picture>
        {% if image.path contains '.avif' %}
            <source type="image/avif" srcSet="{{ site.baseurl }}{{ image.path }}" />
        {% endif %}
        {% if image.path contains '.webp' %}
            <source type="image/webp" srcSet="{{ site.baseurl }}{{ image.path }}" />
        {% endif %}
        {if image.path contains '.jpg' %}
            <img
                alt=""
                decoding="async"
                height="722"
                loading="lazy"
                src="{{ site.baseurl }}{{ image.path }}"
                width="962"
            />
        {% endif %}
        </picture>
        {% endif %}
{% endfor %}
</div>
