use std::num::ParseIntError;

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub enum Error {
    Io(String),
    ParseInt(String),
    Sqlite(String),
    Ammonia(String),
    Tag(String),
    FromUtf8(String),
    EmptyQuery,
    Grep,
}

impl std::error::Error for Error {}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let printable = match self {
            Error::Io(s) => s,
            Error::ParseInt(s) => s,
            Error::Sqlite(s) => s,
            Error::Ammonia(s) => s,
            Error::Tag(s) => s,
            Error::FromUtf8(s) => s,
            Error::EmptyQuery => "Query must not be empty.",
            Error::Grep => "Failed to execute ripgrep.",
        };
        write!(f, "{}", printable)
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Io(err.to_string())
    }
}

impl From<ParseIntError> for Error {
    fn from(err: ParseIntError) -> Self {
        Error::ParseInt(err.to_string())
    }
}

impl From<sqlite::Error> for Error {
    fn from(err: sqlite::Error) -> Self {
        Error::Sqlite(err.to_string())
    }
}

impl From<ammonia::url::ParseError> for Error {
    fn from(err: ammonia::url::ParseError) -> Self {
        Error::Ammonia(err.to_string())
    }
}

impl From<std::string::FromUtf8Error> for Error {
    fn from(err: std::string::FromUtf8Error) -> Self {
        Error::FromUtf8(err.to_string())
    }
}

// impl From<headless_chrome::browser::process::LaunchOptionsBuilderError> for Error {
//     fn from(err: headless_chrome::browser::process::LaunchOptionsBuilderError) -> Self {
//         Error::HeadlessChrome(err.to_string())
//     }
// }

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let body = match self {
            Error::Io(s) => s,
            Error::ParseInt(s) => s,
            Error::Sqlite(s) => s,
            Error::Ammonia(s) => s,
            Error::Tag(s) => s,
            Error::FromUtf8(s) => s,
            Error::EmptyQuery => "Query must not be empty.".to_string(),
            Error::Grep => "Failed to execute ripgrep.".to_string(),
        };
        tracing::error!("{}", body);
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
