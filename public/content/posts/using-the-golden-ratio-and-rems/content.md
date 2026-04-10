---
title: "Web Typography: Using The Golden Ratio and REMs"
slug: "using-the-golden-ratio-and-rems"
date: "2013-05-19T08:03:21"
modified: "2026-04-09T00:00:00"
type: "post"
description: "How to use REM units and the Golden Ratio Typography Calculator to set font sizes, line heights, and margins with mathematical precision."
featuredImage: "./DSC02796.jpg"
categories: ["Code"]
tags: ["css", "how to", "typography"]
---

[WordPress 3.5 beta 1](https://wordpress.org/news/2012/09/wordpress-3-5-beta-1/) shipped with the a new default theme: [*Twenty Twelve*](http://wordpress.org/extend/themes/twentytwelve). While looking at [style.css](http://core.trac.wordpress.org/browser/trunk/wp-content/themes/twentytwelve/style.css), I noticed the use of "REM" to set font sizes and margins. I had NO idea what REM was. In fact, I just started using EMs in other child themes. Immediately, I turned to Google and started researching.

## I thought REM was a band?

By definition, the [REM unit](http://www.w3.org/TR/css3-values/#rem-unit) is: *"Equal to the computed value of ‘font-size’ on the root element. When specified on the ‘font-size’ property of the root element, the ‘rem’ units refer to the property's initial value.*"

**tl;dr** The REM is one of the newest font-size standards for CSS3. It stands for "Root EM". You base your calculation on the *default font size* of the HTML element – NOT the parent-like EM. **It's basically "EM v2.0".**

## So what?

The problem with pixels is, they absolutely do-not-scale. Furthermore, with the onset of Responsive Web Design, having fonts that scale (in relation to the screen width) has become paramount. Percentages (%) and EMs are better, but they're tricky and compound. Still not an answer. A real solution?

## Using REM

First, you need to set a default "root" font-size variable:

```css
html {
  font-size: 62.5%;
}
```

*Why 62.5% instead of 100%?* Simplicity.

Our default font is now `10px`, which makes math easier. Now, `1.0rem = 10px`. This becomes our `--rem-base` CSS custom property.

Calculate other font sizes by dividing your desired size by the `--rem-base` custom property (in pixels). Let's say, you want your `<h1>` tags to be 26px:

```text
26 ÷ 10 = 2.6rem
```

or

```text
32 ÷ 10 = 3.2rem
48 ÷ 10 = 4.8rem
```

and so on.

Let's take a look at a sample Stylesheet:

```css
:root {
  --rem-base: 10;
}

html {
  font-size: 62.5%;
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 1.6rem; /* 16 ÷ var(--rem-base) */
}

h1,
h2 {
  font-size: 2.6rem; /* 26 ÷ var(--rem-base) */
}

h3,
h4 {
  font-size: 1.8rem; /* 18 ÷ var(--rem-base) */
}
```

That looks simple enough, right? Just move the decimal. Now your fonts will scale perfectly during a browser re-size (if using responsive design), or if a user were to zoom in or out.

## Putting it all together with CSS custom properties

Rather than computing these values by hand each time, define them once as CSS custom properties at the `:root` level. Every selector that follows reads from those variables.

```css
:root {
  --rem-base: 10;
  --font-base: 16;
  --line-height-base: 1.625; /* from the Golden Ratio Calculator */
}

html {
  font-size: 62.5%; /* sets 1rem = 10px */
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 1.6rem;
  line-height: var(--line-height-base);
}

h1,
h2 {
  font-size: 2.6rem;
  line-height: 1;
}

h3,
h4 {
  font-size: 1.8rem;
  line-height: 1.444;
}

.some-div {
  margin: 2.4rem 0;
}

.another-div {
  padding: 4.8rem;
  margin-bottom: 2.4rem;
}
```

CSS custom properties are [universally supported](https://caniuse.com/css-variables) in every modern browser. Unlike Sass variables, they work at runtime, can be overridden at any scope, and are visible in DevTools — making them a better fit for responsive type scales.

### Further reading

- [https://grtcalculator.com/](https://grtcalculator.com/)
- [http://snook.ca/archives/html_and_css/font-size-with-rem](http://snook.ca/archives/html_and_css/font-size-with-rem)
- [http://blog.typekit.com/2011/11/09/type-study-sizing-the-legible-letter/](http://blog.typekit.com/2011/11/09/type-study-sizing-the-legible-letter/)
- [http://jsbin.com/acide4/8](http://jsbin.com/acide4/8)
- [http://offroadcode.com/prototypes/rem-calculator/](http://offroadcode.com/prototypes/rem-calculator/)
