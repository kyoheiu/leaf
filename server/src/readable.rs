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
    static ref RE_REPLACE_BRS: Regex = Regex::new(r#"(?is)(<br[^>]*>[ \n\r\t]*){2,}"#).unwrap();
    static ref RE_TITLE_SEPARATOR: Regex = Regex::new(r#"(?is) [\|\-\\/>»] "#).unwrap();
    static ref RE_TITLE_HIERARCHY_SEP: Regex = Regex::new(r#"(?is)[\\/>»]"#).unwrap();
    static ref RE_BY_LINE: Regex = Regex::new(r#"(?is)byline|author|dateline|writtenby|p-author"#).unwrap();
    static ref RE_UNLIKELY_CANDIDATES: Regex = Regex::new(r#"(?is)-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote"#).unwrap();
    static ref RE_OK_MAYBE_CANDIDATE: Regex = Regex::new(r#"(?is)and|article|body|column|content|main|shadow"#).unwrap();
    static ref RE_UNLIKELY_ROLES: Regex = Regex::new(r#"(?is)menu|menubar|complementary|navigation|alert|alertdialog|dialog"#).unwrap();
    static ref RE_POSITIVE: Regex = Regex::new(r#"(?is)article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story"#).unwrap();
    static ref RE_NEGATIVE: Regex = Regex::new(r#"(?is)-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget"#).unwrap();
    static ref RE_DIV_TO_P_ELEMENTS: Regex = Regex::new(r#"(?is)<(a|blockquote|dl|div|img|ol|p|pre|table|ul|select)"#).unwrap();
    static ref RE_VIDEOS: Regex = Regex::new(r#"(?is)//(www\.)?(dailymotion|youtube|youtube-nocookie|player\.vimeo)\.com"#).unwrap();
    static ref RE_P_IS_SENTENCE: Regex = Regex::new(r#"(?is)\.( |$)"#).unwrap();
    static ref RE_COMMENTS: Regex = Regex::new(r#"(?is)<!--[^>]+-->"#).unwrap();
    static ref RE_KILL_BREAKS: Regex = Regex::new(r#"(?is)(<br\s*/?>(\s|&nbsp;?)*)+"#).unwrap();
    static ref RE_SPACES: Regex = Regex::new(r#"(?is)\s{2,}|\n+"#).unwrap();
    static ref RE_HASHURL: Regex = Regex::new(r#"^#.+"#).unwrap();
}

const DATA_TABLE_ATTR: &'static str = "XXX-DATA-TABLE";

macro_rules! is_valid_by_line {
    ($text: expr) => {
        $text.len() > 0 && $text.len() < 100
    };
}

macro_rules! is_element_without_content {
    ($sel: expr) => {{
        let text = $sel.text();
        text.trim() == ""
    }};
}

macro_rules! has_single_p_inside_element {
    ($sel: expr) => {{
        let children = $sel.children();
        children.length() == 1 && children.is("p")
    }};
}

macro_rules! has_child_block_element {
    ($sel: expr) => {{
        let html = $sel.html();
        RE_DIV_TO_P_ELEMENTS.is_match(&html)
    }};
}

macro_rules! get_node_ancestors {
    ($sel:expr, $depth: expr) => {{
        let mut ancestors = vec![];
        let mut parent = $sel.parent();

        for _ in 0..$depth {
            if parent.length() == 0 {
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

macro_rules! get_class_or_id_weight {
    ($sel: expr) => {{
        let mut weight = 0.0;
        let unit = 25.0;

        if let Some(class) = $sel.attr("class") {
            let class = &class.to_lowercase();
            if RE_NEGATIVE.is_match(class) {
                weight -= unit;
            }

            if RE_POSITIVE.is_match(class) {
                weight += unit;
            }
        }

        if let Some(id) = $sel.attr("id") {
            let id = &id.to_lowercase();
            if RE_NEGATIVE.is_match(id) {
                weight -= unit;
            }

            if RE_POSITIVE.is_match(id) {
                weight += unit;
            }
        }

        weight
    }};
}

#[derive(Debug)]
pub struct MetaData {
    pub title: String,
    pub og: Option<String>,
}

impl Default for MetaData {
    fn default() -> MetaData {
        MetaData {
            title: "".to_owned(),
            og: None,
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

fn remove_script(doc: &Document) {
    doc.select("script").remove();
    doc.select("noscript").remove();
}

fn remove_style(doc: &Document) {
    doc.select("style").remove();
}

fn remove_attrs(s: &Selection) {
    s.select("*").iter().into_iter().for_each(|mut s1| {
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
        s1.remove_attr("onclick");
        s1.remove_attr("onmouseover");
        s1.remove_attr("border");
        s1.remove_attr("style");

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

fn remove_headers(sel: &Selection) {
    sel.select("h1,h2,h3").iter().for_each(|mut h| {
        if get_class_or_id_weight!(h) < 0.0 {
            h.remove()
        }
    });
}

fn remove_conditionally(s: &Selection, tag: &str) {
    let is_list = (tag == "ul") || (tag == "ol");
    s.select(tag).iter().for_each(|mut node| {
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
        let weight = get_class_or_id_weight!(&node);
        if weight + content_score < 0.0 {
            node.remove();
            return;
        }

        let node_text = node.text();
        let mut commas_count = node_text.matches(",").count();
        commas_count += node_text.matches("，").count();
        if commas_count < 10 {
            let p = node.select("p").length() as f64;
            let img = node.select("img").length() as f64;
            let li = node.select("li").length() as f64 - 100.0;
            let input = node.select("input").length() as f64;

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
            metadata.og = Some(content.to_string());
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

// Initialize a node with the readability object. Also checks the
// className/id for special names to add to its score.
fn initialize_candidate_item(sel: Selection) -> CandidateItem {
    let mut content_score = 0.0;
    let tag_name = sel.get(0).unwrap().node_name().unwrap_or(StrTendril::new());
    match tag_name.to_lowercase().as_str() {
        // "article" => content_score += 20.0,
        // "section" => content_score += 8.0,
        "div" => content_score += 5.0,
        "pre" | "blockquote" | "td" => content_score += 3.0,
        "form" | "ol" | "ul" | "dl" | "dd" | "dt" | "li" | "adress" => content_score -= 3.0,
        "th" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => content_score -= 5.0,
        _ => (),
    }

    content_score += get_class_or_id_weight!(sel);
    CandidateItem {
        score: content_score,
        sel,
    }
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
        let tag_name = node
            .node_name()
            .unwrap_or_else(|| tendril::StrTendril::new());

        let mut sel = Selection::from(node.clone());
        let class: &str = &sel.attr_or("class", "");
        let id: &str = &sel.attr_or("id", "");
        let match_str = [class.to_lowercase(), id.to_lowercase()].join(" ");

        if let Some(rel) = sel.attr("rel") {
            if rel.deref() == "author" || RE_BY_LINE.is_match(&match_str) {
                let text = sel.text();
                if is_valid_by_line!(&text) {
                    let _author = Some(text.to_string());
                    sel.remove();
                    continue;
                }
            }
        }

        if RE_UNLIKELY_CANDIDATES.is_match(&match_str)
            && !RE_OK_MAYBE_CANDIDATE.is_match(&match_str)
            && !sel.is("html")
            && !has_ancestor_tag(&sel, "table")
            && !has_ancestor_tag(&sel, "code")
            && !sel.is("body")
            && !sel.is("a")
            && get_class_or_id_weight!(&sel) <= 0.0
        {
            sel.remove();
            continue;
        }

        if RE_UNLIKELY_CANDIDATES.is_match(&tag_name) {
            sel.remove();
            continue;
        }

        if RE_UNLIKELY_ROLES.is_match(&sel.attr_or("role", "").to_string()) {
            sel.remove();
            continue;
        }

        // if RE_LIKELY_ELEMENTS.is_match(&tag_name) {
        //     sel.remove();
        //     continue;
        // }

        if sel.is("div,section,header,h1,h2,h3,h4,h5,h6") && is_element_without_content!(&sel) {
            sel.remove();
            continue;
        }
    }

    for mut sel in doc.select("*").iter().into_iter() {
        if sel.is("section,h2,h3,h4,h5,h6,p,td,pre") {
            elements_to_score.push(sel);
        } else if sel.is("div") {
            if has_single_p_inside_element!(&sel) {
                let node = sel.children();
                sel.replace_with_selection(&node);
                elements_to_score.push(sel);
            } else if !has_child_block_element!(&sel) {
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
        let additional = text.len() as f32 / 100.0;
        if additional > 3.0 {
            content_score += 3.0;
        } else {
            content_score += additional;
        }

        for (level, ancestor) in ancestors.into_iter().enumerate() {
            let score_driver = if level == 0 {
                1
            } else if level == 1 {
                2
            } else {
                level * 3
            };

            let id = ancestor.get(0).unwrap().id;
            let rate = 1.0 - get_link_density(&ancestor);
            let score = content_score / (score_driver as f32);
            let mut candidate = initialize_candidate_item(ancestor);
            candidate.score += score;
            candidate.score *= rate;
            candidates.insert(id, candidate);
        }
    }

    let mut top_candidates = vec![];
    for (_, c) in candidates.iter() {
        top_candidates.push(c);
    }
    top_candidates.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    let top_candidate = top_candidates[0].clone();

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
                // let sibling_class = sibling.attr_or("class", "");
                // let bonus =
                //     if sibling_class == top_candidate_class && top_candidate_class.deref() != "" {
                //         top_candidate.score * 0.2
                //     } else {
                //         0.0
                //     };

                let id = sibling.get(0).unwrap().id;
                match candidates.get(&id) {
                    Some(candidate) if candidate.score / top_candidate.score > 0.75 => true,
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

    pre_article(&content, title);

    return clean_html(&new_doc);
}

fn clean_html(doc: &Document) -> String {
    let html = doc.html().to_string();
    let html = RE_COMMENTS.replace_all(&html, "");
    let html = RE_KILL_BREAKS.replace_all(&html, "<br />");
    // let html = RE_SPACES.replace_all(&html, "");

    html.to_string()
}

fn pre_article(content: &Selection, title: &str) {
    mark_data_tables(&content);
    remove_attrs(&content);
    remove_conditionally(&content, "form");
    remove_conditionally(&content, "fieldset");
    remove_tag(&content, "h1");
    remove_tag(&content, "object");
    remove_tag(&content, "embed");
    remove_tag(&content, "footer");
    remove_tag(&content, "aside");
    remove_tag(&content, "link");

    content.select("*").iter().for_each(|mut s| {
        let id = s.attr_or("id", "");
        let class = s.attr_or("class", "");
        let match_str = format!("{} {}", id, class);

        if match_str.contains("share") {
            s.remove();
        }
    });

    let mut h2s = content.select("h2");

    if h2s.length() == 1 {
        let text = h2s.text();
        println!("{} {}", text.len(), title.len());
        let length_similar_rate = text.len() as f64 / title.len() as f64 - 1.0;

        if length_similar_rate.abs() < 0.5 {
            let title_matches = if length_similar_rate > 0.0 {
                text.contains(title)
            } else {
                title.contains(text.deref())
            };

            if title_matches {
                h2s.remove()
            }
        }
    }

    remove_tag(&content, "iframe");
    remove_tag(&content, "input");
    remove_tag(&content, "textarea");
    remove_tag(&content, "select");
    remove_tag(&content, "button");
    remove_headers(&content);

    remove_conditionally(&content, "table");
    remove_conditionally(&content, "ul");
    // remove_conditionally(&content, "div");

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

pub fn readablity(html: &str) -> Result<ParseResult, Error> {
    let document = Document::from(html);

    remove_script(&document);
    remove_style(&document);
    prep_document(&document);

    let metadata = get_article_metadata(&document);
    let html = grab_article(&document, &metadata.title);
    let plain = html_to_string(&html);

    Ok(ParseResult {
        metadata,
        html,
        plain,
    })
}