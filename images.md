# Images <!-- omit in toc -->

The sum of my knoweldge about working with web-based images.

## Table of Contents <!-- omit in toc -->

- [Tools](#tools)
  - [ImageMagick](#imagemagick)
    - [Simple resize](#simple-resize)
    - [Use as a script](#use-as-a-script)
  - [Squoosh](#squoosh)
    - [Simple convert](#simple-convert)
    - [Resize, optimize, and convert](#resize-optimize-and-convert)
  - [Desktop Apps](#desktop-apps)
  - [WordPress Plugins](#wordpress-plugins)
  - [Hosted, On-demand Image Manipulation](#hosted-on-demand-image-manipulation)
- [Lazy-loading](#lazy-loading)
  - [Browser level](#browser-level)
    - [Browser-level Gotchas](#browser-level-gotchas)
  - [Intersection Observer](#intersection-observer)
- [Serve images in modern formats](#serve-images-in-modern-formats)
- [Art direction](#art-direction)

## Tools

### ImageMagick

[ImageMagick](http://www.imagemagick.org/) is the original CLI-based image processing tool and the defacto library on most web servers. It's _very_ powerful, but the documentation is difficult to understand and the syntax is cumbersome. That said, here are some commands that I've used...

#### Simple resize

Resize all `.jpg` images to 400px wide, set the quality to 70%, append `-400` to the end of the filename:

```bash
convert *.jpg -resize 400x -quality 70% -set filename:area "%t-%w" "%[filename:area].jpg"
```

#### Use as a script

Where ImageMagick really shines is when it's used in scripts. Below is a bash function to create some images for a hero component that I want to upload to a website. It requires the [ImageOptim-CLI](https://github.com/JamieMason/ImageOptim-CLI).

1. Add the following to `~/.bashrc` or `~/.zshrc`
2. Restart your terminal
3. Run `heroimage *.jpg`

_Note: this is a destructive operation, so backup your original files first!_

```bash
heroimage() {

 # Convert any PNGs to JPGs.
 magick mogrify -format jpg *.png

 # Create a list of all JPGs in the current directory.
 filelist=`ls | grep '.jpg'`

 # Loop over the list and create image "hero images" of various sizes.
 for image_file in $filelist
  do
   imagename=`convert $image_file -format "%t" info:`
   magick convert $image_file -write +delete \
    (+clone -resize 960x540! -quality 80% -strip -insterlace Plane -set filename:filesize "%wx%h" "./$imagename-$[filename:filesize].jpg" +delete ) \
    (+clone -resize 480x270! -quality 80% -strip -insterlace Plane -set filename:filesize "%wx%h" "./$imagename-$[filename:filesize].jpg" +delete ) \
    -resize 1920x1080! \
    -quality 80% \
    -strip \
    -interlace Plane \
    -set filename:filesize "%wx%h" "./${imagename}-%[filename:filesize].jpg"
 done

 # Run final optimizations through ImageOptim.
 imageoptim ./
}
```

---

### Squoosh

Google has an open-source web app for optimizing images at <https://squoosh.app/> Google also offers the Node-based [Sqoosh CLI](https://github.com/GoogleChromeLabs/squoosh) which is really elegant.

#### Simple convert

Convert all `.jpg` images to `.webp` and `.avif`:

```bash
npx @squoosh/cli *.jpg --avif --webp
```

#### Resize, optimize, and convert

Convert, resize, auto-optimize, and append `_400` to the filename:

```bash
npx @squoosh/cli *.jpg --webp --avif auto --resize {width:400} --suffix _400
```

---

### Desktop Apps

- [ImageOptim](https://imageoptim.com/versions.html)

---

### WordPress Plugins

- [EWWW](https://wordpress.org/plugins/ewww-image-optimizer/) (Free)
- [ReSmush.it](https://resmush.it/) (Free for images up to 5MB)
- [Cloudinary](https://wordpress.org/plugins/cloudinary-image-management-and-manipulation-in-the-cloud-cdn/) (Offers free tier)
- [Jetpack's CDN](https://jetpack.com/features/design/content-delivery-network/) (Free, but requires WordPress.com account. No image optimization)

---

### Hosted, On-demand Image Manipulation

- [Cloudinary](https://cloudinary.com) (Offers free tier)
- [Thumbor](https://github.com/thumbor/thumbor) (Open-source, Cloudinary alternative)
- [Cloudflare](https://cloudflare.com) (Free teir doesn't include image optimization)

## Lazy-loading

<https://web.dev/fast/#lazy-load-images-and-video>

### Browser level

```html
<img alt="A lazy loading image" src="my-image.webp" loading="lazy" />
```

#### Browser-level Gotchas

- If the image is an above-the-fold-hero, be sure to preload it.
- Don't use `loading="lazy"` if the image is above the fold (it increases LCP score)

Example:

```html
<html>
  <head>
    <link rel="preload" as="image" href="/hero-image.webp" />
  </head>
  <body>
    <img alt="A hero image" src="my-image.webp" loading="eager" />
  </body>
</html>
```

See <https://web.dev/lcp-lazy-loading/> and <https://make.wordpress.org/core/2021/07/15/refining-wordpress-cores-lazy-loading-implementation/>

### Intersection Observer

```html
<img
  class="lazy"
  src="placeholder-image.jpg"
  data-src="image-to-lazy-load-1x.jpg"
  data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x"
  alt="I'm an image!"
/>
```

```javascript
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
```

Further reading: <https://web.dev/lazy-loading-images/>

---

## Serve images in modern formats

```html
<picture>
  <!-- Try and load the .avif image -->
  <source type="image/avif" srcset="my-image.avif" />
  <!-- If .avif isn't supported, load the .webp image -->
  <source type="image/webp" srcset="my-image.webp" />
  <!-- If neither .avif nor .webp are supported, load the .jpg image -->
  <img
    alt="an image of a thing"
    decoding="async"
    height="300"
    loading="lazy"
    src="my-image.jpg"
    style="height: auto; width: 100%;"
    width="400"
  />
</picture>
```

> Chances are the `.jpg` from the `<img>` tag wont load (unless it's an old browser), you still need to set the attributes!

Further reading: <https://web.dev/uses-webp-images/>

---

## Art direction

Display a different image based on the viewport:

```html
<div class="align-left">
  <picture>
    <!-- on mobile, center and stack, display the 400px image -->
    <source
      type="image/webp"
      media="(max-width: 600px)"
      srcset="my-image-400.webp"
    />
    <!-- on tablets, continue to center and stack, but display a higher resolution image -->
    <source
      type="image/webp"
      media="(min-width: 601px) and (max-width: 1023px)"
      srcset="my-image.webp"
    />
    <!-- on desktops, align the image left, and display the 400px image again -->
    <source
      type="image/webp"
      media="(min-width: 1024px)"
      srcset="my-image-400.webp"
    />
    <!-- for older browsers, just display a .JPG -->
    <img
      alt="an image of a thing"
      decode="async"
      height="300"
      loading="lazy"
      src="my-image.jpg"
      style="height: auto; width: 100%;"
      width="400"
    />
  </picture>
</div>
```

> Chances are the `.jpg` from the `<img>` tag wont load (unless it's an old browser), you still need to set the attributes!

Further reading: <https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction>

---
