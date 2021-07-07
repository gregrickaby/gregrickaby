# Photos

<div>
    {% for image in site.static_files %}
        {% if image.path contains 'assets/photos' %}
        <a href="{{ image.path }}">
            <picture>
                {% if image.extname == '.avif' %}
                    <source type="image/avif" srcSet="{{ site.baseurl }}{{ image.path }}" />
                {% endif %}
                {% if image.extname == '.webp' %}
                    <source type="image/webp" srcSet="{{ site.baseurl }}{{ image.path }}" />
                {% endif %}
                {if image.extname == '.jpg' %}
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
        </a>
        {% endif %}
{% endfor %}
</div>
