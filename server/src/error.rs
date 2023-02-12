use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub enum AcidError {
    Io(String),
    Sqlite(String),
    Readability(String),
    Ammonia(String),
    Tantivy(String),
}

impl std::error::Error for AcidError {}

impl std::fmt::Display for AcidError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let printable = match self {
            AcidError::Io(s) => s,
            AcidError::Sqlite(s) => s,
            AcidError::Readability(s) => s,
            AcidError::Ammonia(s) => s,
            AcidError::Tantivy(s) => s,
        };
        write!(f, "{}", printable)
    }
}

impl From<std::io::Error> for AcidError {
    fn from(err: std::io::Error) -> Self {
        AcidError::Io(err.to_string())
    }
}

impl From<sqlite::Error> for AcidError {
    fn from(err: sqlite::Error) -> Self {
        AcidError::Sqlite(err.to_string())
    }
}

impl From<readability_fork::error::Error> for AcidError {
    fn from(err: readability_fork::error::Error) -> Self {
        AcidError::Readability(err.to_string())
    }
}

impl From<ammonia::url::ParseError> for AcidError {
    fn from(err: ammonia::url::ParseError) -> Self {
        AcidError::Ammonia(err.to_string())
    }
}

impl From<tantivy::TantivyError> for AcidError {
    fn from(err: tantivy::TantivyError) -> Self {
        AcidError::Tantivy(err.to_string())
    }
}

impl IntoResponse for AcidError {
    fn into_response(self) -> Response {
        let body = match self {
            AcidError::Io(s) => s,
            AcidError::Sqlite(s) => s,
            AcidError::Readability(s) => s,
            AcidError::Ammonia(s) => s,
            AcidError::Tantivy(s) => s,
        };
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
