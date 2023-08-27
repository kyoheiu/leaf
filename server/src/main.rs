mod core;
mod error;
mod handler;
mod statements;
mod types;

use crate::core::{run, Core};

use error::Error;
use std::net::TcpListener;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let core = Core::new()?;
    let listener = TcpListener::bind("0.0.0.0:8000").expect("Failed to listen.");
    info!("Start listening on {:?}", listener);
    run(listener, core).await;
    Ok(())
}
