pub fn scrape_og(html: &str) -> Option<String> {
    let document = scraper::Html::parse_document(html);
    let head_selector = scraper::Selector::parse("head").unwrap();
    let meta_selector = scraper::Selector::parse("meta").unwrap();

    let head = document.select(&head_selector).next().unwrap();
    println!("{}", head.html());
    for element in head.select(&meta_selector) {
        println!("{}", element.html());
        if let Some(v) = element.value().attr("property") {
            if v == "og:image" {
                return element.value().attr("content").map(|x| x.to_owned());
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scrape_og() {
        let sample = r#"
<!doctype html>
<html lang="en-US">
<head data-template-path="https://hacks.mozilla.org/wp-content/themes/Hax">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="w2ocEMd5yV9IsGCjhq-7ls67r4VH-Ob6oWdiZpqjN8U">

  
  <meta name="title" content="Merging two GitHub repositories without losing commit history – Mozilla Hacks - the Web developer blog">

    <meta property="og:site_name" content="Mozilla Hacks &#8211; the Web developer blog">
  <meta property="og:url" content="https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history">
  <meta property="og:title" content="Merging two GitHub repositories without losing commit history – Mozilla Hacks - the Web developer blog">
  <meta property="og:description" content="How do you merge two Git repositories without losing history? This post will take you through the step by step process.">
  <meta property="og:image" content="https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png">
  <meta property="og:image:width" content="1920">
  <meta property="og:image:height" content="1080">

    <meta property="twitter:title" content="Merging two GitHub repositories without losing commit history – Mozilla Hacks - the Web developer blog">
  <meta property="twitter:description" content="How do you merge two Git repositories without losing history? This post will take you through the step by step process.">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:image" content="https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png">
  <meta name="twitter:site" content="@mozhacks">

  <link href='//fonts.googleapis.com/css?family=Open+Sans:400,400italic,700,700italic' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="https://hacks.mozilla.org/wp-content/themes/Hax/css/font-awesome.min.css">
  <link rel="stylesheet" href="https://hacks.mozilla.org/wp-content/themes/Hax/style.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/highlight.js/8.6.0/styles/solarized_light.min.css">

  <script type="text/javascript">
    window.hacks = {};
    // http://cfsimplicity.com/61/removing-analytics-clutter-from-campaign-urls
    var removeUtms  =   function(){
        var l = window.location;
        if( l.hash.indexOf( "utm" ) != -1 ){
            var anchor = l.hash.match(/#(?!utm)[^&]+/);
            anchor  =   anchor? anchor[0]: '';
            if(!anchor && window.history.replaceState){
                history.replaceState({},'', l.pathname + l.search);
            } else {
                l.hash = anchor;
            }
        };
    };

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-35433268-8'],
              ['_setAllowAnchor', true]);
    _gaq.push (['_gat._anonymizeIp']);
    _gaq.push(['_trackPageview']);
    _gaq.push( removeUtms );
    (function(d, k) {
      var ga = d.createElement(k); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = d.getElementsByTagName(k)[0]; s.parentNode.insertBefore(ga, s);
    })(document, 'script');
  </script>

  <meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' />
<meta name="blog-name" content="Mozilla Hacks - the Web developer blog" />

	<!-- This site is optimized with the Yoast SEO plugin v19.13 - https://yoast.com/wordpress/plugins/seo/ -->
	<title>Merging two GitHub repositories without losing commit history - Mozilla Hacks - the Web developer blog</title>
	<meta name="description" content="How do you merge two Git repositories without losing history? This post will take you through the step by step process." />
	<link rel="canonical" href="https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/" />
	<meta name="twitter:label1" content="Written by" />
	<meta name="twitter:data1" content="Schalk Neethling" />
	<meta name="twitter:label2" content="Est. reading time" />
	<meta name="twitter:data2" content="15 minutes" />
	<script type="application/ld+json" class="yoast-schema-graph">{"@context":"https://schema.org","@graph":[{"@type":"WebPage","@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/","url":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/","name":"Merging two GitHub repositories without losing commit history - Mozilla Hacks - the Web developer blog","isPartOf":{"@id":"https://hacks.mozilla.org/#website"},"primaryImageOfPage":{"@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/#primaryimage"},"image":{"@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/#primaryimage"},"thumbnailUrl":"https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png","datePublished":"2022-08-29T07:54:58+00:00","dateModified":"2022-08-29T07:54:58+00:00","author":{"@id":"https://hacks.mozilla.org/#/schema/person/ab446252f82d3a333ba0e851938aea46"},"description":"How do you merge two Git repositories without losing history? This post will take you through the step by step process.","breadcrumb":{"@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/#breadcrumb"},"inLanguage":"en-US","potentialAction":[{"@type":"ReadAction","target":["https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/"]}]},{"@type":"ImageObject","inLanguage":"en-US","@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/#primaryimage","url":"https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png","contentUrl":"https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png","width":1920,"height":1080},{"@type":"BreadcrumbList","@id":"https://hacks.mozilla.org/2022/08/merging-two-github-repositories-without-losing-commit-history/#breadcrumb","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://hacks.mozilla.org/"},{"@type":"ListItem","position":2,"name":"Articles","item":"https://hacks.mozilla.org/articles/"},{"@type":"ListItem","position":3,"name":"Merging two GitHub repositories without losing commit history"}]},{"@type":"WebSite","@id":"https://hacks.mozilla.org/#website","url":"https://hacks.mozilla.org/","name":"Mozilla Hacks - the Web developer blog","description":"hacks.mozilla.org","potentialAction":[{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://hacks.mozilla.org/?s={search_term_string}"},"query-input":"required name=search_term_string"}],"inLanguage":"en-US"},{"@type":"Person","@id":"https://hacks.mozilla.org/#/schema/person/ab446252f82d3a333ba0e851938aea46","name":"Schalk Neethling","image":{"@type":"ImageObject","inLanguage":"en-US","@id":"https://hacks.mozilla.org/#/schema/person/image/e7109a0830ee7cf91572187845b4bfb6","url":"https://secure.gravatar.com/avatar/3f0e9b6231df27e285c4589d21c4ae46?s=96&d=mm&r=g","contentUrl":"https://secure.gravatar.com/avatar/3f0e9b6231df27e285c4589d21c4ae46?s=96&d=mm&r=g","caption":"Schalk Neethling"},"description":"I am a Mozillian, an evangelist, writer and developer with a passion for open source, web standards and accessibility. I have been so involved with these worlds that I feel they have become a part of me and cannot foresee a future where these topics will not be a part of my daily life.","sameAs":["http://schalkneethling.com","https://twitter.com/schalkneethling"],"url":"https://hacks.mozilla.org/author/sneethlingmozilla-com/"}]}</script>
	<!-- / Yoast SEO plugin. -->


<link rel="alternate" type="application/rss+xml" title="Mozilla Hacks - the Web developer blog &raquo; Feed" href="https://hacks.mozilla.org/feed/" />
<link rel="alternate" type="application/rss+xml" title="Mozilla Hacks - the Web developer blog &raquo; Comments Feed" href="https://hacks.mozilla.org/comments/feed/" />
<link rel='stylesheet' id='wp-block-library-css' href='https://hacks.mozilla.org/wp-includes/css/dist/block-library/style.min.css?ver=6.1.1' type='text/css' media='all' />
<link rel='stylesheet' id='classic-theme-styles-css' href='https://hacks.mozilla.org/wp-includes/css/classic-themes.min.css?ver=1' type='text/css' media='all' />
<style id='global-styles-inline-css' type='text/css'>
body{--wp--preset--color--black: #000000;--wp--preset--color--cyan-bluish-gray: #abb8c3;--wp--preset--color--white: #ffffff;--wp--preset--color--pale-pink: #f78da7;--wp--preset--color--vivid-red: #cf2e2e;--wp--preset--color--luminous-vivid-orange: #ff6900;--wp--preset--color--luminous-vivid-amber: #fcb900;--wp--preset--color--light-green-cyan: #7bdcb5;--wp--preset--color--vivid-green-cyan: #00d084;--wp--preset--color--pale-cyan-blue: #8ed1fc;--wp--preset--color--vivid-cyan-blue: #0693e3;--wp--preset--color--vivid-purple: #9b51e0;--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%);--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%);--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%);--wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%);--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%);--wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%);--wp--preset--gradient--blush-light-purple: linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%);--wp--preset--gradient--blush-bordeaux: linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%);--wp--preset--gradient--luminous-dusk: linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%);--wp--preset--gradient--pale-ocean: linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%);--wp--preset--gradient--electric-grass: linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%);--wp--preset--gradient--midnight: linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%);--wp--preset--duotone--dark-grayscale: url('#wp-duotone-dark-grayscale');--wp--preset--duotone--grayscale: url('#wp-duotone-grayscale');--wp--preset--duotone--purple-yellow: url('#wp-duotone-purple-yellow');--wp--preset--duotone--blue-red: url('#wp-duotone-blue-red');--wp--preset--duotone--midnight: url('#wp-duotone-midnight');--wp--preset--duotone--magenta-yellow: url('#wp-duotone-magenta-yellow');--wp--preset--duotone--purple-green: url('#wp-duotone-purple-green');--wp--preset--duotone--blue-orange: url('#wp-duotone-blue-orange');--wp--preset--font-size--small: 13px;--wp--preset--font-size--medium: 20px;--wp--preset--font-size--large: 36px;--wp--preset--font-size--x-large: 42px;--wp--preset--spacing--20: 0.44rem;--wp--preset--spacing--30: 0.67rem;--wp--preset--spacing--40: 1rem;--wp--preset--spacing--50: 1.5rem;--wp--preset--spacing--60: 2.25rem;--wp--preset--spacing--70: 3.38rem;--wp--preset--spacing--80: 5.06rem;}:where(.is-layout-flex){gap: 0.5em;}body .is-layout-flow > .alignleft{float: left;margin-inline-start: 0;margin-inline-end: 2em;}body .is-layout-flow > .alignright{float: right;margin-inline-start: 2em;margin-inline-end: 0;}body .is-layout-flow > .aligncenter{margin-left: auto !important;margin-right: auto !important;}body .is-layout-constrained > .alignleft{float: left;margin-inline-start: 0;margin-inline-end: 2em;}body .is-layout-constrained > .alignright{float: right;margin-inline-start: 2em;margin-inline-end: 0;}body .is-layout-constrained > .aligncenter{margin-left: auto !important;margin-right: auto !important;}body .is-layout-constrained > :where(:not(.alignleft):not(.alignright):not(.alignfull)){max-width: var(--wp--style--global--content-size);margin-left: auto !important;margin-right: auto !important;}body .is-layout-constrained > .alignwide{max-width: var(--wp--style--global--wide-size);}body .is-layout-flex{display: flex;}body .is-layout-flex{flex-wrap: wrap;align-items: center;}body .is-layout-flex > *{margin: 0;}:where(.wp-block-columns.is-layout-flex){gap: 2em;}.has-black-color{color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-color{color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-color{color: var(--wp--preset--color--white) !important;}.has-pale-pink-color{color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-color{color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-color{color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-color{color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-color{color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-color{color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-color{color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-color{color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-color{color: var(--wp--preset--color--vivid-purple) !important;}.has-black-background-color{background-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-background-color{background-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-background-color{background-color: var(--wp--preset--color--white) !important;}.has-pale-pink-background-color{background-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-background-color{background-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-background-color{background-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-background-color{background-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-background-color{background-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-background-color{background-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-background-color{background-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-background-color{background-color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-background-color{background-color: var(--wp--preset--color--vivid-purple) !important;}.has-black-border-color{border-color: var(--wp--preset--color--black) !important;}.has-cyan-bluish-gray-border-color{border-color: var(--wp--preset--color--cyan-bluish-gray) !important;}.has-white-border-color{border-color: var(--wp--preset--color--white) !important;}.has-pale-pink-border-color{border-color: var(--wp--preset--color--pale-pink) !important;}.has-vivid-red-border-color{border-color: var(--wp--preset--color--vivid-red) !important;}.has-luminous-vivid-orange-border-color{border-color: var(--wp--preset--color--luminous-vivid-orange) !important;}.has-luminous-vivid-amber-border-color{border-color: var(--wp--preset--color--luminous-vivid-amber) !important;}.has-light-green-cyan-border-color{border-color: var(--wp--preset--color--light-green-cyan) !important;}.has-vivid-green-cyan-border-color{border-color: var(--wp--preset--color--vivid-green-cyan) !important;}.has-pale-cyan-blue-border-color{border-color: var(--wp--preset--color--pale-cyan-blue) !important;}.has-vivid-cyan-blue-border-color{border-color: var(--wp--preset--color--vivid-cyan-blue) !important;}.has-vivid-purple-border-color{border-color: var(--wp--preset--color--vivid-purple) !important;}.has-vivid-cyan-blue-to-vivid-purple-gradient-background{background: var(--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple) !important;}.has-light-green-cyan-to-vivid-green-cyan-gradient-background{background: var(--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan) !important;}.has-luminous-vivid-amber-to-luminous-vivid-orange-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange) !important;}.has-luminous-vivid-orange-to-vivid-red-gradient-background{background: var(--wp--preset--gradient--luminous-vivid-orange-to-vivid-red) !important;}.has-very-light-gray-to-cyan-bluish-gray-gradient-background{background: var(--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray) !important;}.has-cool-to-warm-spectrum-gradient-background{background: var(--wp--preset--gradient--cool-to-warm-spectrum) !important;}.has-blush-light-purple-gradient-background{background: var(--wp--preset--gradient--blush-light-purple) !important;}.has-blush-bordeaux-gradient-background{background: var(--wp--preset--gradient--blush-bordeaux) !important;}.has-luminous-dusk-gradient-background{background: var(--wp--preset--gradient--luminous-dusk) !important;}.has-pale-ocean-gradient-background{background: var(--wp--preset--gradient--pale-ocean) !important;}.has-electric-grass-gradient-background{background: var(--wp--preset--gradient--electric-grass) !important;}.has-midnight-gradient-background{background: var(--wp--preset--gradient--midnight) !important;}.has-small-font-size{font-size: var(--wp--preset--font-size--small) !important;}.has-medium-font-size{font-size: var(--wp--preset--font-size--medium) !important;}.has-large-font-size{font-size: var(--wp--preset--font-size--large) !important;}.has-x-large-font-size{font-size: var(--wp--preset--font-size--x-large) !important;}
.wp-block-navigation a:where(:not(.wp-element-button)){color: inherit;}
:where(.wp-block-columns.is-layout-flex){gap: 2em;}
.wp-block-pullquote{font-size: 1.5em;line-height: 1.6;}
</style>
<script type='text/javascript' src='https://hacks.mozilla.org/wp-includes/js/jquery/jquery.min.js?ver=3.6.1' id='jquery-core-js'></script>
<script type='text/javascript' src='https://hacks.mozilla.org/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.3.2' id='jquery-migrate-js'></script>
<script type='text/javascript' src='https://hacks.mozilla.org/wp-content/themes/Hax/js/analytics.js?ver=6.1.1' id='analytics-js'></script>
<link rel="https://api.w.org/" href="https://hacks.mozilla.org/wp-json/" /><link rel="alternate" type="application/json" href="https://hacks.mozilla.org/wp-json/wp/v2/posts/47913" /><link rel="EditURI" type="application/rsd+xml" title="RSD" href="https://hacks.mozilla.org/xmlrpc.php?rsd" />
<link rel="wlwmanifest" type="application/wlwmanifest+xml" href="https://hacks.mozilla.org/wp-includes/wlwmanifest.xml" />
<link rel='shortlink' href='https://hacks.mozilla.org/?p=47913' />
<link rel="alternate" type="application/json+oembed" href="https://hacks.mozilla.org/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fhacks.mozilla.org%2F2022%2F08%2Fmerging-two-github-repositories-without-losing-commit-history%2F" />
<link rel="alternate" type="text/xml+oembed" href="https://hacks.mozilla.org/wp-json/oembed/1.0/embed?url=https%3A%2F%2Fhacks.mozilla.org%2F2022%2F08%2Fmerging-two-github-repositories-without-losing-commit-history%2F&#038;format=xml" />
<link rel="shortcut icon" type="image/x-icon" href="https://hacks.mozilla.org/wp-content/themes/Hax/favicon.ico" /><style>#wpadminbar #wp-admin-bar-site-name>.ab-item:before { content: none !important;}li#wp-admin-bar-site-name a { background: url( "https://hacks.mozilla.org/wp-content/themes/Hax/favicon.ico" ) left center/20px no-repeat !important; padding-left: 21px !important; background-size: 20px !important; } li#wp-admin-bar-site-name { margin-left: 5px !important; } li#wp-admin-bar-site-name {} #wp-admin-bar-site-name div a { background: none !important; }
</style></head>
<body>
  <div class="outer-wrapper">
    <header class="section section--fullwidth header">
      <div class="masthead row">
        <div class="branding block block--3">
          <h1>
            <a href="https://hacks.mozilla.org">
              <img class="branding__logo" src="https://hacks.mozilla.org/wp-content/themes/Hax/img/mdn-logo-mono.svg">
              <img class="branding__wordmark" src="https://hacks.mozilla.org/wp-content/themes/Hax/img/wordmark.svg" alt="Mozilla">
              <span class="branding__title">Hac<span class="logo-askew">k</span>s</span>
            </a>
          </h1>
        </div>
        <div class="search block block--2">
          <form class="search__form" method="get" action="https://hacks.mozilla.org/">
            <input type="search" name="s" class="search__input" placeholder="Search Mozilla Hacks" value="">
            <i class="fa fa-search search__badge"></i>
          </form>
        </div>
        <nav class="social">
          <a class="social__link youtube" href="http://www.youtube.com/user/mozhacks" title="YouTube"><i class="fa fa-youtube" aria-hidden="true"></i><span>Hacks on YouTube</span></a>
          <a class="social__link twitter" href="https://twitter.com/mozhacks" title="Twitter"><i class="fa fa-twitter" aria-hidden="true"></i><span>@mozhacks on Twitter</span></a>
          <a class="social__link rss" href="https://hacks.mozilla.org/feed/" title="RSS Feed"><i class="fa fa-rss" aria-hidden="true"></i><span>Hacks RSS Feed</span></a>
          <a class="fx-button" href="https://www.mozilla.org/firefox/download/thanks/?utm_source=hacks.mozilla.org&utm_medium=referral&utm_campaign=header-download-button&utm_content=header-download-button">Download Firefox</a>
        </nav>
      </div>
    </header>

  
<div id="content-head" class="section">
  <h1 class="post__title">Merging two GitHub repositories without losing commit history</h1>
  <div class="byline">
    <h3 class="post__author">
                      <img alt='' src='https://secure.gravatar.com/avatar/3f0e9b6231df27e285c4589d21c4ae46?s=64&#038;d=mm&#038;r=g' srcset='https://secure.gravatar.com/avatar/3f0e9b6231df27e285c4589d21c4ae46?s=128&#038;d=mm&#038;r=g 2x' class='avatar avatar-64 photo' height='64' width='64' loading='lazy' decoding='async'/>        By
                                        <a class="url" href="http://schalkneethling.com" rel="external me">Schalk Neethling</a>                            </h2>
    <div class="post__meta">
      Posted on
      <abbr class="published" title="2022-08-29T00:54:58-07:00">
        August 29, 2022      </abbr>
      <span class="entry-cat">in
        <a href="https://hacks.mozilla.org/category/featured/" rel="category tag" title="View all posts in Featured Article" >Featured Article</a>, <a href="https://hacks.mozilla.org/category/git-github/" rel="category tag" title="View all posts in Git &amp; GitHub" >Git &amp; GitHub</a>,  and <a href="https://hacks.mozilla.org/category/mdn/" rel="category tag" title="View all posts in MDN" >MDN</a>      </span>
            <div class="socialshare" data-type="bubbles"></div>
    </div>
  </div>
</div>
        "#;
        assert_eq!(Some("https://hacks.mozilla.org/files/2022/02/moz_blog_header_MDN-Intro-e1646143402836.png".to_owned()), scrape_og(&sample));
    }
}
