---
title: "Genesis Code Snippets"
slug: "genesis-code-snippets"
date: "2013-05-19T10:37:14"
modified: "2023-05-09T19:49:23"
type: "post"
description: "My collection of code snippets that I use while coding the Genesis Framework for WordPress."
featuredImage: "./DSC4934.jpg"
categories: ["Code"]
tags: ["genesis", "how to", "snippets"]
---

Here is my collection of code snippets I use build child themes in [Genesis](https://gregslink.co/try-genesis).

If it's not here, please check out Bill Erickson's [Genesis Quick Tips](http://www.billerickson.net/genesis-quick-tips/), Gary's [Code](http://code.garyjones.co.uk/), or Brian Gardner's [Code](http://www.briangardner.com/code/). Thanks to [Gary J](http://twitter.com/garyj) for advice on cleaning up the code snippets to adhere with coding standards.

NOTE: While all of these functions still work, some may not with Genesis 2.0's new hook structure. Check out [this visual guide](http://genesistutorials.com/visual-hook-guide/) to make adjustments.

Quickly navigate to a section:

- [Header](#header)
- [Template](#template)
- [Body](#body)
- [Sidebars](#sidebars)
- [Footer](#footer)
- [Development](#development)
## Header

**Custom Header Support**

```php
/** Add custom header support */
add_theme_support( 'genesis-custom-header', array( 'width' => 960, 'height' => 100, 'textcolor' => '444', 'admin_header_callback' => 'minimum_admin_style' ) );
```

**Remove Header**

```php
/** Remove Header */
remove_action( 'genesis_header', 'genesis_do_header' );
```

**Remove Title & Description**

```php
/** Remove Title & Description */
remove_action( 'genesis_site_title', 'genesis_seo_site_title' );
remove_action( 'genesis_site_description', 'genesis_seo_site_description' );
```

**Build a Custom Title**

```php
remove_action( 'genesis_site_title', 'genesis_seo_site_title' );
add_action( 'genesis_site_title', 'child_seo_site_title' ); /** * Remove title, add <span> in-between Buzz. * Then add title back to header. * * @author Greg Rickaby * @since 1.0.0 */
function child_seo_site_title() { echo '<h1 id="title"><span>Buzz</span>Montgomery.com</h1>'; }
```

**Move Navigation Menu**

```php
/** Move primary nav menu */
remove_action( 'genesis_after_header', 'genesis_do_nav' );
add_action( 'genesis_before_header', 'genesis_do_nav' );
```

**Move Secondary Navigation Menu**

```php
/** Move secondary nav menu */
remove_action( 'genesis_after_header', 'genesis_do_subnav' );
add_action( 'genesis_before_header', 'genesis_do_subnav' );
```

**Favicon To CDN**

```php
add_filter( 'genesis_pre_load_favicon', 'child_favicon_filter' );
/** * Change the location of the favicon reference. * * @author Greg Rickaby * @since 1.0.0 */
function child_favicon_filter( $favicon_url ) { return 'http://cdn.yoursite.com/wp-content/themes/child/images/favicon.ico'; }
```

**Stylesheet To CDN**

```php
remove_action( 'genesis_meta', 'genesis_load_stylesheet' );
add_action( 'genesis_meta', 'child_stylesheet_cdn' );
/** * Change the location of the stylesheet reference. * * @author Greg Rickaby * @since 1.0.0 */
function child_stylesheet_cdn() { echo '<link rel="stylesheet" href="http://cdn.yourdomain.com/wp-content/themes/child/style.css" type="text/css" media="screen" />'."\n"; }
```

**Move jQuery To Google CDN**

```php
add_action( 'wp_enqueue_scripts', 'script_managment', 99);
/** * Change the location of jQuery. * * @author Greg Rickaby * @since 1.0.0 */
function script_managment() { wp_deregister_script( 'jquery' ); wp_deregister_script( 'jquery-ui' ); wp_register_script( 'jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js' ); wp_register_script( 'jquery-ui', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js' ); wp_enqueue_script( 'jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js', array( 'jquery' ), '4.0', false ); wp_enqueue_script( 'jquery-ui', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js', array( 'jquery' ), '1.8.16' );
}
```

**Add viewport for responsive (mobile) design**

```php
/** Add Viewport meta tag for mobile browsers */
add_action( 'genesis_meta', 'child_viewport_meta_tag' );
function child_viewport_meta_tag() { echo '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>';
}
```

## Template

**Place WP-Cycle (must have [WP-Cycle](http://wordpress.org/extend/plugins/wp-cycle/) plug-in installed first)**

```php
/** Place WP-Cycle */
add_action( 'genesis_before_loop', 'wp_cycle' );
```

**Image Sizes**

```php
/** Custom image sizes */
add_image_size( 'Slideshow', 520, 280, TRUE );
add_image_size( 'Small Thumbnail', 70, 70, TRUE );
```

**Post Thumbnails**

```php
/** Add support for post thumbnails */
set_post_thumbnail_size( 300, 165, TRUE );
```

**Post Formats**

```php
/** Add support for post formats */
add_theme_support( 'post-formats', array( 'aside', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video', 'audio' )); /** Add support for post format images */
add_theme_support( 'genesis-post-format-images' );
```

**Unregister Site Layouts**

```php
/** Unregister site layouts */
genesis_unregister_layout( 'sidebar-content' )
genesis_unregister_layout( 'full-width' )
genesis_unregister_layout( 'content-sidebar-sidebar' );
genesis_unregister_layout( 'sidebar-sidebar-content' );
genesis_unregister_layout( 'sidebar-content-sidebar' );
```

**Force Layout**

```php
add_filter( 'genesis_pre_get_option_site_layout', 'child_do_layout' );
/** * Force layout * * @author Greg Rickaby * @since 1.0.0 */
function child_do_layout( $opt ) { $opt = 'full-width-content'; // You can change this to any Genesis layout return $opt;
}
```

**Use the Genesis Custom Loop**

```php
remove_action( 'genesis_loop', 'genesis_do_loop' );
add_action( 'genesis_loop', 'custom_loop' );
/** * Remove default loop. Execute Custom Loop Instead. * * @author Greg Rickaby * @since 1.0.0 */
function custom_loop() {
global $paged; $args = ( array( 'category_name' => 'Blog', 'order' => 'asc', 'order_by' => 'title', 'paged' => $paged, 'posts_per_page' => 5 ) ); genesis_custom_loop( $args ); } genesis();
```

**Custom Page Template**

```php
<?php
/*
Template Name: Custom Page Template
*/ // Remove page title
remove_action( 'genesis_entry_header', 'genesis_do_post_title' ); // Force full width content (optional)
add_filter( 'genesis_pre_get_option_site_layout', '__genesis_return_full_width_content' ); // Remove default Genesis loop
remove_action( 'genesis_loop', 'genesis_do_loop' ); // Add new custom loop
add_action( 'genesis_loop', 'child_custom_loop' ); /** * Execute child loop */
function child_custom_loop() { ?> <!-- custom code here --> <?php } genesis();

```

**Use the Genesis Grid Loop in `front-page.php`**

```php
remove_action( 'genesis_loop', 'genesis_do_loop' );
add_action( 'genesis_loop', 'child_grid_loop_helper' );
/** Add support for Genesis Grid Loop **/
function child_grid_loop_helper() { if ( function_exists( 'genesis_grid_loop' ) ) { remove_action( 'genesis_before_post_content', 'generate_post_image', 5 ); genesis_grid_loop( array( 'features' => 2, 'feature_image_size' => 'large', 'feature_image_class' => 'aligncenter post-image', 'feature_content_limit' => 0, 'grid_image_size' => 'grid', 'grid_image_class' => 'alignleft post-image', 'grid_content_limit' => 0, 'more' => __( 'Continue reading...', 'genesis' ), 'posts_per_page' => 6, ) ); } else { genesis_standard_loop(); } } genesis();
```

**Filter out duplicate posts in the WordPress Loop**

```php
$do_not_duplicate = array(); query_posts( 'cat=featured&showposts=6' ); while ( have_posts() ) : the_post(); $do_not_duplicate[] = $post->ID; <!-- do stuff -->
endwhile; wp_reset_query();
```

**Add Widgets And WP-Cycle To `front-page.php`**

```php
remove_action( 'genesis_after_post_content', 'genesis_post_meta', 10 );
remove_action( 'genesis_loop', 'genesis_do_loop' );
add_action( 'genesis_before_loop', 'wp_cycle' );
add_action( 'genesis_loop', 'child_home_loop_helper' );
/** * Add Widgets and WP-Cycle to home.php. * * @author Greg Rickaby * @since 1.0.0 */
function child_home_loop_helper() { ?> <div id="homepage_widgets"> <div class="column1"> <ul> <?php if ( !function_exists( 'dynamic_sidebar' ) || !dynamic_sidebar( 'Home 1' ) ){ ?><?php } ?> </ul> </div> <div class="column2"> <ul> <?php if ( !function_exists( 'dynamic_sidebar' ) || !dynamic_sidebar( 'Home 2' ) ){ ?><?php } ?> </ul> </div>
</div> <?php } genesis();
```

## Body

**Remove Post Titles**

```php
/** Custom post titles */
remove_action( 'genesis_post_title','genesis_do_post_title' );
```

**Remove Post Titles Using Conditional Tags**

```php
remove_action( 'genesis_post_title','genesis_do_post_title' );
add_action( 'genesis_post_title','child_post_title' );
/** * Remove Post Title with conditional tag. * */
function child_post_title() { if ( is_front_page() ) { remove_action( 'genesis_post_title','genesis_do_post_title' ); }}
```

See the [WordPress Codex](http://codex.wordpress.org/Conditional_Tags) for more conditional tags.

**Remove Edit Link**

```php
/** Remove Edit Link */
add_filter( 'edit_post_link', '__return_false' );
```

**Remove default Post Image**

```php
/** Remove default post image */
remove_action( 'genesis_post_content', 'genesis_do_post_image' );
```

**Add Post Image above Title**

```php
/** Add custom post image above post title */
add_action( 'genesis_before_post_content', 'generate_post_image', 5 );
function generate_post_image() { if ( is_page() || ! genesis_get_option( 'content_archive_thumbnail' ) ) return; if ( $image = genesis_get_image( array( 'format' => 'url', 'size' => genesis_get_option( 'image_size' ) ) ) ) { printf( '<a href="%s" rel="bookmark"><img class="post-image" src="%s" alt="%s" /></a>', get_permalink(), $image, the_title_attribute( 'echo=0' ) ); } }
```

**Custom Post Info (with Shortcodes)**

```php
add_filter( 'genesis_post_info', 'child_post_info_filter' );
/** * Custom Post Info with shortcodes. * * @author Greg Rickaby * @since 1.0.0 */
function child_post_info_filter( $post_info ) { return '[post_date] by [post_author_posts_link] at [post_time] [post_comments] [post_edit]';
}
```

**Remove Post Info (Author and Date information)**

```php
/** Remove post info */
remove_action( 'genesis_before_post_content', 'genesis_post_info' );
```

**Remove Post Meta**

```php
/** Remove the post meta function */
remove_action( 'genesis_after_post_content', 'genesis_post_meta' );
```

**Custom Post Meta (With Shortcodes)**

```php
add_filter( 'genesis_post_meta', 'child_post_meta_filter' );
/** * Custom Post Meta with shortcodes. * * @author Greg Rickaby * @since 1.0.0 */
function child_post_meta_filter( $post_meta ) { return '[post_categories] Tagged with [post_tags]';
}
```

**Read More Link**

```php
add_filter( 'excerpt_more', 'child_read_more_link' );
add_filter( 'get_the_content_more_link', 'child_read_more_link' );
add_filter( 'the_content_more_link', 'child_read_more_link' );
/** * Custom Read More link. * * @author Greg Rickaby * @since 1.0.0 */
function child_read_more_link() { return '<a class="more-link" href="' . get_permalink() . '" rel="nofollow">Continue Reading...</a>';
}
```

**Change Avatar Size**

```php
add_filter( 'genesis_comment_list_args', 'child_comment_list_args' );
/** * Change Avatar size. * * @author Greg Rickaby * @since 1.0.0 */
function child_comment_list_args( $args ) { return array( 'type' => 'comment', 'avatar_size' => 42, 'callback' => 'genesis_comment_callback' );
}
```

## Sidebars

**Remove Default Sidebar**

```php
/** Remove default sidebar */
remove_action( 'genesis_sidebar', 'genesis_do_sidebar' );
```

**Remove Secondary Sidebars**

```php
/** Remove secondary sidebar */
unregister_sidebar( 'header-right' );
unregister_sidebar( 'sidebar' );
unregister_sidebar( 'sidebar-alt' );
```

**Add Custom Sidebar**

```php
/** Add custom sidebar */
genesis_register_sidebar(array( 'name'=>'Alternative Sidebar', 'id' => 'sidebar-alternative', 'description' => 'This is an alternative sidebar', 'before_widget' => '<div id="%1$s"><div class="widget %2$s">', 'after_widget'  => "</div></div>\n", 'before_title'  => '<h4><span>', 'after_title'   => "</span></h4>\n"
));
```

**Add Widgets**

```php
add_action( 'genesis_sidebar', 'child_do_sidebar' );
/** * Add a widget/sidebar area. * * @author Greg Rickaby * @since 1.0.0 */
function child_do_sidebar() { if ( !function_exists( 'dynamic_sidebar' ) || !dynamic_sidebar( 'Sidebar Name' ) ) {
}}
```

## Footer

**Custom Footer and Footer Nav (with Shortcodes)**

```php
add_filter( 'genesis_footer_output', 'child_output_filter', 10, 3 );
/** * Custom Footer with shortcodes. * * @author Greg Rickaby * @since 1.0.0 */
function child_output_filter( $backtotop_text, $creds_text ) { $backtotop_text = '[footer_backtotop text="Top of Page"]'; $creds_text = wp_nav_menu( array( 'menu' => 'Footer Nav' )); return '<div>' . $backtotop_text . '</div>' . '<div>' . $creds_text . '</div>'; }
```

**Remove Footer Widgets (Genesis 1.6+)**

```php
/** Remove footer widgets */
remove_theme_support( 'genesis-footer-widgets', 3 );
```

**Remove Footer**

```php
/** Remove Footer */
remove_action( 'genesis_footer', 'genesis_do_footer' );
```

**Create a Custom Footer with HTML**

```php
remove_action( 'genesis_footer', 'genesis_do_footer' );
add_action( 'genesis_footer', 'child_footer_html' );
/** * Custom Footer with HTML. * * @author Greg Rickaby * @since 1.0.0 */
function child_footer_html() { ?> <div class="banner alignleft"> <!-- openx text/code here --> </div> <div class="creds"> <!-- credit text/code here --> <div> <?php }
```

## Development

**Get settings from database**

```php
genesis_get_option( 'option_name', $this->settings_field )
```

**Get settings from database for custom metaboxes**

```php
genesis_get_custom_field( 'meta_box_option_name' )
```

**Cache Bust your CSS**

```php
add_filter( 'stylesheet_uri', 'child_stylesheet_uri' );
/** * Cache bust the style.css reference. * */
function child_stylesheet_uri( $stylesheet_uri ) { return add_query_arg( 'v', filemtime( get_stylesheet_directory() . '/style.css' ), $stylesheet_uri );
}
```
