use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug)]
pub enum AcidError {
    Readability(String),
}

impl std::error::Error for AcidError {}

impl std::fmt::Display for AcidError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let printable = match self {
            AcidError::Readability(s) => s,
        };
        write!(f, "{}", printable)
    }
}

impl From<readability::error::Error> for AcidError {
    fn from(err: readability::error::Error) -> Self {
        AcidError::Readability(err.to_string())
    }
}

impl IntoResponse for AcidError {
    fn into_response(self) -> Response {
        let body = match self {
            AcidError::Readability(s) => s,
        };
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
