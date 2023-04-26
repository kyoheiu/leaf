// Blatantly imported from https://github.com/importcjj/nipper/blob/master/examples/readability.rs
// Modified according to https://github.com/mozilla/readability v.0.4.3

use html5ever::tendril;
use html5ever::tendril::StrTendril;
use lazy_static::lazy_static;
use nipper::Document;
use nipper::Selection;
use regex::Regex;
use std::collections::HashMap;
use std::ops::Deref;

use crate::error::Error;
lazy_static! {
    static ref RE_REPLACE_BRS: Regex = Regex::new(r#"(?i)(<br[^>]*>[ \n\r\t]*){2,}"#).unwrap();
    static ref RE_TITLE_SEPARATOR: Regex = Regex::new(r#"(?i) [\|\-\\/>»] "#).unwrap();
    static ref RE_TITLE_HIERARCHY_SEP: Regex = Regex::new(r#"(?i)[\\/>»]"#).unwrap();
    static ref RE_BYLINE: Regex = Regex::new(r#"(?i)byline|author|dateline|writtenby|p-author"#).unwrap();
    static ref RE_UNLIKELY_CANDIDATES: Regex = Regex::new(r#"(?i)-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote"#).unwrap();
    static ref RE_OK_MAYBE_CANDIDATE: Regex = Regex::new(r#"(?i)and|article|body|column|content|main|shadow"#).unwrap();
    static ref RE_UNLIKELY_ROLES: Regex = Regex::new(r#"(?i)menu|menubar|complementary|navigation|alert|alertdialog|dialog"#).unwrap();
    static ref RE_POSITIVE: Regex = Regex::new(r#"(?i)article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story"#).unwrap();
    static ref RE_NEGATIVE: Regex = Regex::new(r#"-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget"#).unwrap();
    static ref RE_DIV_TO_P_ELEMENTS: Regex = Regex::new(r#"(?i)<(a|blockquote|dl|div|img|ol|p|pre|table|ul)"#).unwrap();
    static ref RE_VIDEOS: Regex = Regex::new(r#"(?i)//(www\.)?(dailymotion|youtube|youtube-nocookie|player\.vimeo)\.com"#).unwrap();
    static ref RE_P_IS_SENTENCE: Regex = Regex::new(r#"(?i)\.( |$)"#).unwrap();
    static ref RE_COMMENTS: Regex = Regex::new(r#"(?i)<!--[^>]+-->"#).unwrap();
    static ref RE_KILL_BREAKS: Regex = Regex::new(r#"(?i)(<br\s*/?>(\s|&nbsp;?)*)+"#).unwrap();
    static ref RE_SPACES: Regex = Regex::new(r#"(?i)\s{2,}|\n+"#).unwrap();
    static ref RE_HASHURL: Regex = Regex::new(r#"^#.+"#).unwrap();
    static ref RE_SHARE_ELEMENT: Regex = Regex::new(r#"(?i)(\b|_)(share|sharedaddy)(\b|_)"#).unwrap();
    static ref RE_PHRASING_ELEMS: Regex = Regex::new(r#"(?i)^(abbr|audio|b|bdo|br|button|cite|code|data|datalist|dfn
    em|embed|i|img|input|kbd|label|mark|math|meter|noscript|object|output|progress|q|ruby|samp|script|select|small|span|strong|sub|sup|textarea|time|var|wbr)$"#).unwrap();
}

const DATA_TABLE_ATTR: &'static str = "XXX-DATA-TABLE";

macro_rules! is_valid_by_line {
    ($text: expr) => {
        $text.len() > 0 && $text.len() < 100
    };
}

macro_rules! has_single_p_inside_element {
    ($sel: expr) => {{
        let children = $sel.children();
        children.length() == 1 && children.is("p")
    }};
}

macro_rules! get_node_ancestors {
    ($sel:expr, $depth: expr) => {{
        let mut ancestors = vec![];
        let mut parent = $sel.parent();

        for _ in 0..$depth {
            if !parent.exists() {
                break;
            } else {
                ancestors.push(parent.clone());
                parent = parent.parent();
            }
        }

        ancestors
    }};
}

macro_rules! set_node_tag {
    ($sel: expr, $tag: expr) => {{
        let html = $sel.html();
        let new_html = format!("<{}>{}<{}>", $tag, html, $tag);
        $sel.replace_with_html(new_html.as_str());
    }};
}

#[derive(Debug)]
pub struct MetaData {
    pub title: String,
    pub cover: Option<String>,
}

impl Default for MetaData {
    fn default() -> MetaData {
        MetaData {
            title: "".to_owned(),
            cover: None,
        }
    }
}

#[derive(Debug)]
pub struct ParseResult {
    pub metadata: MetaData,
    pub html: String,
    pub plain: String,
}

#[derive(Debug, Clone)]
struct CandidateItem<'a> {
    score: f32,
    sel: Selection<'a>,
}

fn shingles(s: &str) -> std::collections::HashSet<String> {
    let chars: Vec<_> = s.chars().collect();
    chars
        .windows(2)
        .map(|w| w.iter().cloned().collect())
        .collect()
}

fn jaccard_distance(s1: &str, s2: &str) -> f64 {
    let s1_shingles = shingles(s1);
    let s2_shingles = shingles(s2);
    let inter = s1_shingles.intersection(&s2_shingles).count();
    let union = s1_shingles.union(&s2_shingles).count();
    (inter as f64) / (union as f64)
}

fn remove_noscript_images(doc: &Document) {
    doc.select("img").iter().for_each(|mut img| {
        if img.attr("src").is_none()
            && img.attr("srcset").is_none()
            && img.attr("data-src").is_none()
            && img.attr("data-srcset").is_none()
        {
            img.remove();
        }
    })
}

fn remove_script(doc: &Document) {
    doc.select("script").remove();
    doc.select("noscript").remove();
}

fn remove_style(doc: &Document) {
    doc.select("style").remove();
}

fn is_element_without_content(sel: &Selection) -> bool {
    let children = sel.children();
    sel.text().trim().len() == 0
        && (children.length() == 0
            || children.length() == sel.select("br").length() + sel.select("hr").length())
}

#[allow(dead_code)]
fn remove_attrs(s: &Selection) {
    s.select("*").iter().for_each(|mut s1| {
        let tag_name = s1
            .get(0)
            .unwrap()
            .node_name()
            .unwrap_or(tendril::StrTendril::new());
        if tag_name.to_lowercase() == "svg" {
            return;
        }

        s1.remove_attr("align");
        s1.remove_attr("background");
        s1.remove_attr("bgcolor");
        s1.remove_attr("border");
        s1.remove_attr("cellpadding");
        s1.remove_attr("cellspacing");
        s1.remove_attr("frame");
        s1.remove_attr("hspace");
        s1.remove_attr("rules");
        s1.remove_attr("style");
        s1.remove_attr("valign");
        s1.remove_attr("vspace");

        if tag_name.deref() != "table"
            && tag_name.deref() != "th"
            && tag_name.deref() != "td"
            && tag_name.deref() != "hr"
            && tag_name.deref() != "pre"
        {
            s1.remove_attr("width");
            s1.remove_attr("height");
        }
    })
}

fn remove_tag(sel: &Selection, tag: &str) {
    let is_embed = (tag == "object") || (tag == "embed") || (tag == "iframe");

    sel.select(tag).iter().for_each(|mut target| {
        let attrs = target.get(0).unwrap().attrs();
        let attr_values: Vec<&str> = attrs.iter().map(|attr| attr.value.deref()).collect();
        let attr_str = attr_values.join(" ");

        if is_embed && RE_VIDEOS.is_match(&attr_str) {
            return;
        }

        if is_embed && RE_VIDEOS.is_match(&target.text()) {
            return;
        }

        target.remove();
    })
}

fn remove_conditionally(s: &Selection, tag: &str) {
    s.select(tag).iter().for_each(|mut node| {
        let mut is_list = (tag == "ul") || (tag == "ol");
        if !is_list {
            let mut list_length = 0;
            node.select("ul,ol").iter().for_each(|li| {
                list_length += li.text().len();
            });
            is_list = list_length as f32 / node.text().len() as f32 > 0.9;
        }

        if let Some(ancestor) = get_ancestor_tag(&node, "table", 100) {
            if let Some(value) = ancestor.attr(DATA_TABLE_ATTR) {
                if value.deref() == "1" {
                    return;
                }
            }
        }

        if tag == "table" {
            node.remove_attr(DATA_TABLE_ATTR);
        }

        let content_score = 0.0;
        let weight = get_class_or_id_weight(&node);
        if weight + content_score < 0.0 {
            node.remove();
            return;
        }

        let node_text = node.text();
        let commas_count = node_text.matches(|c| c == ',' || c == '、').count();
        if commas_count < 10 {
            let p = node.select("p").length() as f32;
            let img = node.select("img").length() as f32;
            let li = node.select("li").length() as f32 - 100.0;
            let input = node.select("input").length() as f32;

            let mut embed_count = 0;
            node.select("embed").iter().for_each(|embed| {
                let attr = embed.attr_or("src", "");
                if !RE_VIDEOS.is_match(&attr) {
                    embed_count += 1;
                }
            });

            let content_length = node_text.len();
            let link_density = get_link_density(&node);
            let ancestor = get_ancestor_tag(&node, "figure", 3);
            let has_to_remove = (!is_list && li > p)
                || (img > 1.0 && p / img < 0.5 && ancestor.is_none())
                || (input > (p / 3.0))
                || (!is_list
                    && content_length < 25
                    && (img == 0.0 || img > 2.0)
                    && ancestor.is_none())
                || (!is_list && weight < 25.0 && link_density > 0.2)
                || (weight >= 25.0 && link_density > 0.5)
                || ((embed_count == 1 && content_length < 75) || embed_count > 1);

            if has_to_remove {
                node.remove();
            }
        }
    })
}

fn is_probably_visible(sel: &Selection) -> bool {
    sel.attr("hidden").is_none()
        && (sel.attr("aria-hidden").is_none()
            || sel.attr("aria-hidden") != Some(StrTendril::from("true"))
            || sel.has_class("fallback-image"))
}

fn get_link_density(sel: &Selection) -> f32 {
    let text_length = sel.text().len();
    if text_length == 0 {
        return 0.0;
    }

    let mut link_length: f32 = 0.0;
    sel.select("a").iter().for_each(|a| {
        let href = a.attr("href");
        let co_efficient: f32 = match href {
            Some(h) => {
                if RE_HASHURL.is_match(&h.to_string()) {
                    0.3
                } else {
                    1.0
                }
            }
            None => 1.0,
        };
        link_length += a.text().len() as f32 * co_efficient;
    });
    link_length / text_length as f32
}

fn get_ancestor_tag<'a>(s: &'a Selection, tag: &str, depth: usize) -> Option<Selection<'a>> {
    let mut parent = s.parent();
    for _ in 0..depth {
        if parent.length() == 0 {
            break;
        }

        if parent.is(tag) {
            return Some(parent);
        }

        parent = parent.parent();
    }

    None
}

fn replace_brs(doc: &Document) {
    let mut body = doc.select("body");

    let mut html: &str = &body.html();
    let r = RE_REPLACE_BRS.replace_all(&html, "<p></p>");
    html = &r;
    body.set_html(html);

    body.select("p").iter().for_each(|mut p| {
        let html: &str = &p.html();
        if html.trim() == "" {
            p.remove();
        }
    });
}

fn prep_document(doc: &Document) {
    remove_style(&doc);
    replace_brs(&doc);

    doc.select("font").iter().for_each(|mut font| {
        let html: &str = &font.html();
        let mut new_html = "<span>".to_string();
        new_html.push_str(html);
        new_html.push_str("</span>");
        font.replace_with_html(new_html.as_str());
    })
}

fn get_article_metadata(doc: &Document) -> MetaData {
    let mut metadata = MetaData::default();

    doc.select("meta").iter().for_each(|meta| {
        let name = meta.attr_or("name", "");
        let property = meta.attr_or("property", "");
        let content = meta.attr_or("content", "");

        if content.deref() == "" {
            return;
        }

        if property.deref() == "og:image" || name.deref() == "twitter:image" {
            metadata.cover = Some(content.to_string());
        }

        if property.deref() == "og:title" || name.deref() == "twitter:title" {
            metadata.title = content.to_string();
        }
    });

    if metadata.title.is_empty() {
        metadata.title = get_article_title(doc);
    }

    metadata
}

fn get_article_title(doc: &Document) -> String {
    let original_title = doc.select("title").iter().next().map(|t| t.text());

    match original_title {
        Some(title) => title.to_string(),
        None => "No Title".to_owned(),
    }
}

fn has_child_block_element(sel: &Selection) -> bool {
    sel.children().iter().any(|child| {
        child.is("blockquote,dl,div,img,ol,p,pre,table,ul") || has_child_block_element(&child)
    })
}

fn is_phrasing_content(sel: &Selection) -> bool {
    let tag_name = sel
        .get(0)
        .unwrap()
        .node_name()
        .unwrap_or(StrTendril::new())
        .to_string();
    RE_PHRASING_ELEMS.is_match(&tag_name)
        || (tag_name == "a"
            || tag_name == "del"
            || tag_name == "ins" && sel.children().iter().all(|x| is_phrasing_content(&x)))
}

fn is_whitespace(sel: &Selection) -> bool {
    sel.text().len() == 0 || sel.is("br")
}

// Initialize a node with the readability object. Also checks the
// className/id for special names to add to its score.
fn initialize_candidate_item<'a>(sel: Selection<'a>) -> CandidateItem<'a> {
    let mut content_score = 0.0;
    let tag_name = sel.get(0).unwrap().node_name().unwrap_or(StrTendril::new());
    match tag_name.to_lowercase().as_str() {
        "div" => content_score += 5.0,
        "pre" | "blockquote" | "td" => content_score += 3.0,
        "form" | "ol" | "ul" | "dl" | "dd" | "dt" | "li" | "adress" => content_score -= 3.0,
        "th" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => content_score -= 5.0,
        _ => (),
    }
    content_score += get_class_or_id_weight(&sel);
    CandidateItem {
        score: content_score,
        sel,
    }
}

fn get_class_or_id_weight(sel: &Selection) -> f32 {
    let mut weight = 0.0;
    let unit = 25.0;

    if let Some(class) = sel.attr("class") {
        let class = &class.to_string();
        if RE_NEGATIVE.is_match(class) {
            weight -= unit;
        }

        if RE_POSITIVE.is_match(class) {
            weight += unit;
        }
    }

    if let Some(id) = sel.attr("id") {
        let id = &id.to_string();
        if RE_NEGATIVE.is_match(id) {
            weight -= unit;
        }

        if RE_POSITIVE.is_match(id) {
            weight += unit;
        }
    }

    weight
}

fn has_ancestor_tag(sel: &Selection, tag_name: &str) -> bool {
    let mut now = sel.clone();
    let max_depth = 3;
    let mut depth: usize = 0;
    while now.exists() && depth <= max_depth {
        if now.is(tag_name) {
            return true;
        } else {
            depth += 1;
            now = now.parent();
        }
    }
    false
}

fn grab_article<'a>(doc: &'a Document, title: &str) -> String {
    let mut elements_to_score = vec![];

    // Remove unrelated-ish nodes
    for node in doc.select("*").nodes() {
        let mut sel = Selection::from(node.clone());
        let class: &str = &sel.attr_or("class", "");
        let id: &str = &sel.attr_or("id", "");
        let match_str = format!("{} {}", class.to_lowercase(), id.to_lowercase());

        if !is_probably_visible(&sel) {
            sel.remove();
            continue;
        }

        // User is not able to see elements applied with both "aria-modal = true" and "role = dialcover"
        if sel.attr("aria-modal").is_some()
            && sel.attr("role") == Some(StrTendril::from("dialcover"))
        {
            sel.remove();
            continue;
        }

        if let Some(rel) = sel.attr("rel") {
            if rel.deref() == "author" || RE_BYLINE.is_match(&match_str) {
                let text = sel.text();
                if is_valid_by_line!(&text) {
                    sel.remove();
                    continue;
                }
            }
        }

        // Remove unlikely candidates
        if RE_UNLIKELY_CANDIDATES.is_match(&match_str)
            && !RE_OK_MAYBE_CANDIDATE.is_match(&match_str)
            && !has_ancestor_tag(&sel, "table")
            && !has_ancestor_tag(&sel, "code")
            && !sel.is("body")
            && !sel.is("a")
        {
            sel.remove();
            continue;
        }

        if sel.is("div,section,header,h1,h2,h3,h4,h5,h6") && is_element_without_content(&sel) {
            sel.remove();
            continue;
        }
    }

    for mut sel in doc.select("*").iter() {
        if sel.is("section,h2,h3,h4,h5,h6,p,td,pre") {
            elements_to_score.push(sel);
        } else if sel.is("div") {
            let mut children_of_p = vec![];
            for child in sel.children().iter() {
                if is_phrasing_content(&child) && is_whitespace(&child) {
                    children_of_p.push(child);
                }
            }
            if !children_of_p.is_empty() {
                let mut p = String::new();
                for child in children_of_p {
                    p.push_str(&child.html().to_string());
                }
                p = format!("<p>{}</p>", p);
                sel.replace_with_html(p.as_str());
            }

            if has_single_p_inside_element!(&sel) && get_link_density(&sel) < 0.25 {
                let node = sel.children();
                sel.replace_with_selection(&node);
                elements_to_score.push(sel);
            } else if !has_child_block_element(&sel) {
                set_node_tag!(&mut sel, "p");
                elements_to_score.push(sel);
            }
        }
    }

    let mut candidates = HashMap::new();
    for e in elements_to_score {
        // If this paragraph is less than 25 characters, don't even count it.
        let text = e.text();
        if text.len() < 25 {
            continue;
        }

        // Exclude nodes with no ancestor.
        let ancestors = get_node_ancestors!(e, 5);
        if ancestors.len() == 0 {
            continue;
        }

        let mut content_score: f32 = 0.0;

        // Add a point for the paragraph itself as a base.
        content_score += 1.0;

        // Add points for any commas within this paragraph.
        content_score += text.matches(|c| c == ',' || c == '、').count() as f32;

        // For every 100 characters in this paragraph, add another point. Up to 3 points.
        content_score += f32::min(text.len() as f32 / 100.0, 3.0);

        for (level, ancestor) in ancestors.into_iter().enumerate() {
            let score_divider = if level == 0 {
                1
            } else if level == 1 {
                2
            } else {
                level * 3
            };

            let id = ancestor.get(0).unwrap().id;
            let score = content_score / (score_divider as f32);
            let mut candidate = initialize_candidate_item(ancestor);
            candidate.score += score;
            candidates
                .entry(id)
                .and_modify(|c: &mut CandidateItem| c.score += score)
                .or_insert(candidate);
        }
    }

    let mut top_candidates = vec![];
    for (_, c) in candidates.iter_mut() {
        c.score *= 1.0 - get_link_density(&c.sel);
        top_candidates.push(c);
    }
    top_candidates.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    let mut top_candidate = top_candidates[0].clone();

    // Because of our bonus system, parents of candidates might have scores
    // themselves. They get half of the node. There won't be nodes with higher
    // scores than our topCandidate, but if we see the score going *up* in the first
    // few steps up the tree, that's a decent sign that there might be more content
    // lurking in other places that we want to unify in. The sibling stuff
    // below does some of that - but only if we've looked high enough up the DOM
    // tree.

    let mut parent_of_top = top_candidate.sel.parent();
    let mut last_score = top_candidate.score;
    let score_threshold = last_score / 3.0;
    while !parent_of_top.is("body") {
        match candidates.get(&parent_of_top.get(0).unwrap().id) {
            None => {
                parent_of_top = parent_of_top.parent();
                continue;
            }
            Some(c) => {
                let parent_score = c.score;
                if parent_score > score_threshold {
                    break;
                }
                if parent_score > last_score {
                    top_candidate = c.clone();
                    break;
                }
                last_score = c.score;
                parent_of_top = parent_of_top.parent();
            }
        }
    }

    // If the top candidate is the only child, use parent instead. This will help sibling
    // joining logic when adjacent content is actually located in parent's sibling node.
    let mut parent_of_top = top_candidate.sel.parent();
    while !parent_of_top.is("body") && parent_of_top.children().length() == 1 {
        top_candidate = match candidates.get(&parent_of_top.get(0).unwrap().id) {
            Some(c) => c.clone(),
            None => initialize_candidate_item(parent_of_top),
        };
        parent_of_top = top_candidate.sel.parent();
    }

    let new_doc = Document::from(r#""#);
    let mut content = new_doc.select("body");

    let top_selection = &top_candidate.sel;
    top_selection
        .parent()
        .children()
        .iter()
        .for_each(|sibling| {
            let append_sibling = if sibling.is_selection(&top_selection) {
                true
            } else {
                let bonus = if sibling.attr("class") == top_selection.attr("class")
                    && top_selection.attr("class").is_some()
                {
                    top_candidate.score * 0.2
                } else {
                    0.0
                };

                let id = sibling.get(0).unwrap().id;
                let score_threshold = f32::max(10.0, top_candidate.score * 0.2);
                match candidates.get(&id) {
                    Some(candidate) if candidate.score + bonus > score_threshold => true,
                    _ => {
                        if sibling.is("p") {
                            let link_density = get_link_density(&sibling);
                            let node_content = sibling.text();
                            let node_length = sibling.length();

                            if node_length > 80 && link_density < 0.25 {
                                true
                            } else if node_length < 80
                                && node_length > 0
                                && link_density == 0.0
                                && RE_P_IS_SENTENCE.is_match(&node_content)
                            {
                                true
                            } else {
                                false
                            }
                        } else {
                            false
                        }
                    }
                }
            };

            if append_sibling {
                let html = sibling.html();
                content.append_html(html);
            }
        });

    prep_article(&content, title);

    return clean_html(&new_doc.select("body"));
}

fn prep_article(content: &Selection, title: &str) {
    mark_data_tables(&content);

    // do not have to do this because we have ammonia.
    // remove_attrs(&content);

    // remove_conditionally(&content, "form");
    // remove_conditionally(&content, "fieldset");
    // remove_tag(&content, "object");
    // remove_tag(&content, "embed");
    remove_tag(&content, "footer");
    // remove_tag(&content, "link");
    remove_tag(&content, "aside");

    content.select("*").iter().for_each(|mut s| {
        let id = s.attr_or("id", "");
        let class = s.attr_or("class", "");
        let match_str = format!("{} {}", id, class);

        if RE_SHARE_ELEMENT.is_match(&match_str) && s.text().len() < 500 {
            s.remove();
        }
    });

    // remove_tag(&content, "iframe");
    // remove_tag(&content, "input");
    // remove_tag(&content, "textarea");
    // remove_tag(&content, "select");
    // remove_tag(&content, "button");

    // Do these last as the previous stuff may have removed junk
    // that will affect these
    remove_conditionally(&content, "table");
    remove_conditionally(&content, "ul");
    remove_conditionally(&content, "div");

    content.select("h1").iter().for_each(|mut h1| {
        if jaccard_distance(&h1.text().to_string(), title) < 0.75 {
            let html: &str = &h1.html();
            let mut h2 = "<h2>".to_string();
            h2.push_str(html);
            h2.push_str("</h2>");
            h1.replace_with_html(h2.as_str());
        }
    });

    content.select("p").iter().for_each(|mut p| {
        let img = p.select("img").length();
        let embed = p.select("embed").length();
        let object = p.select("object").length();
        let iframe = p.select("iframe").length();
        let total = img + embed + object + iframe;

        let p_text = p.text();
        if total == 0 && p_text.len() == 0 {
            p.remove()
        }
    });

    content.select("br").iter().for_each(|mut br| {
        if br.next_sibling().is("p") {
            br.remove()
        }
    })
}

fn clean_html(doc: &Selection) -> String {
    let html = doc.html().to_string();
    let html = RE_COMMENTS.replace_all(&html, "");
    let html = RE_KILL_BREAKS.replace_all(&html, "<br />");
    // let html = RE_SPACES.replace_all(&html, "");

    html.to_string()
}

fn mark_data_tables(s: &Selection) {
    let data_table_descendants = vec!["col", "colgroup", "tfoot", "thead", "th"];
    s.select("table").iter().for_each(|mut table| {
        let role = table.attr_or("role", "");
        if role.deref() == "presentation" {
            return;
        }

        let datatable = table.attr_or("datatable", "");
        if datatable.deref() == "0" {
            return;
        }

        if table.attr("summary").is_some() {
            table.set_attr(DATA_TABLE_ATTR, "1");
            return;
        }

        let caption = table.select("caption");
        if caption.length() > 0 && caption.children().length() > 0 {
            table.set_attr(DATA_TABLE_ATTR, "1");
            return;
        }

        for tag in &data_table_descendants {
            if table.select(tag).length() > 0 {
                table.set_attr(DATA_TABLE_ATTR, "1");
                return;
            }
        }

        if table.select("table").length() > 0 {
            return;
        }

        let (rows, colums) = get_table_row_and_column_count(&table);
        if rows > 10 || colums > 4 {
            table.set_attr(DATA_TABLE_ATTR, "1");
            return;
        }

        if rows * colums > 10 {
            table.set_attr(DATA_TABLE_ATTR, "1");
            return;
        }
    })
}

fn get_table_row_and_column_count(table: &Selection) -> (usize, usize) {
    let mut rows = 0;
    let mut columns = 0;

    table.select("tr").iter().for_each(|tr| {
        let str_row_span = tr.attr_or("rowspan", "1");
        let row_span = str_row_span.parse::<usize>().unwrap_or(1);

        rows += row_span;
        let mut column_in_this_row = 0;
        tr.select("td").iter().for_each(|td| {
            let str_col_span = td.attr_or("colspan", "");
            let col_span = str_col_span.parse::<usize>().unwrap_or(1);
            column_in_this_row += col_span;
        });

        if column_in_this_row > columns {
            columns = column_in_this_row;
        }
    });

    (rows, columns)
}

fn html_to_string(html: &str) -> String {
    let document = Document::from(html);
    let mut result = String::new();

    for node in document.select("*").nodes() {
        result.push_str(&node.text());
    }
    result
}

pub fn readability(html: &str) -> Result<ParseResult, Error> {
    let document = Document::from(html);

    remove_noscript_images(&document);
    remove_script(&document);
    prep_document(&document);

    let metadata = get_article_metadata(&document);
    let html = grab_article(&document, &metadata.title);

    let mut cleaner = ammonia::Builder::default();
    let cleaner = cleaner.url_relative(ammonia::UrlRelative::Deny);
    let sanitized = cleaner.clean(&html).to_string();

    let plain = html_to_string(&sanitized);

    Ok(ParseResult {
        metadata,
        html: sanitized,
        plain,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::read_to_string;
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn difft(left: String, right: String) {
        let mut file_left = NamedTempFile::new().unwrap();
        writeln!(file_left, "{}", left).unwrap();
        let mut file_right = NamedTempFile::new().unwrap();
        writeln!(file_right, "{}", right).unwrap();
        let output = std::process::Command::new("difft")
            .args([file_left.path(), file_right.path()])
            .output()
            .unwrap();
        let diff = output.stdout;
        println!("{}", String::from_utf8(diff).unwrap());
        file_left.close().unwrap();
        file_right.close().unwrap();
    }

    #[test]
    fn test_readability_001() {
        // https://zenn.dev/inamiy/books/3dd014a50f321040a047/viewer/ff60bc16b7b952a91adb
        let source = read_to_string("tests/001_source.html").unwrap();
        let result = readability(&source).unwrap().html;
        let expected = read_to_string("tests/001_expected.html").unwrap();
        difft(result.clone(), expected.clone());
        assert_eq!(result, expected);
    }

    #[test]
    fn test_readability_002() {
        // https://drewdevault.com/2023/03/09/2023-03-09-Comment-or-no-comment.html
        let source = read_to_string("tests/002_source.html").unwrap();
        let result = readability(&source).unwrap().html;
        let expected = read_to_string("tests/002_expected.html").unwrap();
        difft(result.clone(), expected.clone());
        assert_eq!(result, expected);
    }

    #[test]
    fn test_readability_003() {
        // https://drewdevault.com/2023/04/24/2023-04-24-Who-leads-us.html
        let source = read_to_string("tests/003_source.html").unwrap();
        let result = readability(&source).unwrap().html;
        let expected = read_to_string("tests/003_expected.html").unwrap();
        difft(result.clone(), expected.clone());
        assert_eq!(result, expected);
    }

    #[test]
    fn test_readability_004() {
        // https://zenn.dev/msakuta/articles/fdea72a964dd08
        let source = read_to_string("tests/004_source.html").unwrap();
        let result = readability(&source).unwrap().html;
        let expected = read_to_string("tests/004_expected.html").unwrap();
        difft(result.clone(), expected.clone());
        assert_eq!(result, expected);
    }
}
