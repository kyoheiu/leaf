use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub enum HmstrError {
    Io(String),
    Sqlite(String),
    Readability(String),
    Ammonia(String),
    Tantivy(String),
    Tag(String),
    HeadlessChrome(String),
}

impl std::error::Error for HmstrError {}

impl std::fmt::Display for HmstrError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let printable = match self {
            HmstrError::Io(s) => s,
            HmstrError::Sqlite(s) => s,
            HmstrError::Readability(s) => s,
            HmstrError::Ammonia(s) => s,
            HmstrError::Tantivy(s) => s,
            HmstrError::Tag(s) => s,
            HmstrError::HeadlessChrome(s) => s,
        };
        write!(f, "{}", printable)
    }
}

impl From<std::io::Error> for HmstrError {
    fn from(err: std::io::Error) -> Self {
        HmstrError::Io(err.to_string())
    }
}

impl From<sqlite::Error> for HmstrError {
    fn from(err: sqlite::Error) -> Self {
        HmstrError::Sqlite(err.to_string())
    }
}

impl From<readability_fork::error::Error> for HmstrError {
    fn from(err: readability_fork::error::Error) -> Self {
        HmstrError::Readability(err.to_string())
    }
}

impl From<ammonia::url::ParseError> for HmstrError {
    fn from(err: ammonia::url::ParseError) -> Self {
        HmstrError::Ammonia(err.to_string())
    }
}

impl From<tantivy::TantivyError> for HmstrError {
    fn from(err: tantivy::TantivyError) -> Self {
        HmstrError::Tantivy(err.to_string())
    }
}

impl From<anyhow::Error> for HmstrError {
    fn from(err: anyhow::Error) -> Self {
        HmstrError::HeadlessChrome(err.to_string())
    }
}

// impl From<headless_chrome::browser::process::LaunchOptionsBuilderError> for HmstrError {
//     fn from(err: headless_chrome::browser::process::LaunchOptionsBuilderError) -> Self {
//         HmstrError::HeadlessChrome(err.to_string())
//     }
// }

impl IntoResponse for HmstrError {
    fn into_response(self) -> Response {
        let body = match self {
            HmstrError::Io(s) => s,
            HmstrError::Sqlite(s) => s,
            HmstrError::Readability(s) => s,
            HmstrError::Ammonia(s) => s,
            HmstrError::Tantivy(s) => s,
            HmstrError::Tag(s) => s,
            HmstrError::HeadlessChrome(s) => s,
        };
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
