mod core;
mod error;
mod handler;
mod schema;
mod scrape;
mod statements;
mod types;

use crate::core::{run, Core};

use error::AcidError;
use log::{error, info, warn};
use std::{net::TcpListener, path::PathBuf};

#[tokio::main]
async fn main() -> Result<(), AcidError> {
    env_logger::init();
    let mut args = std::env::args();

    if args.len() > 1 {
        if args.len() == 2 && args.nth(1).unwrap() == "init" {
            let db_path = PathBuf::from("./databases");
            if db_path.exists() {
                match std::fs::remove_dir_all(db_path) {
                    Ok(_) => {
                        info!("Deleted old databases directory.");
                        let _core = Core::new()?;
                        Ok(info!("Created databases."))
                    }
                    Err(e) => {
                        error!("{}", e);
                        Ok(())
                    }
                }
            } else {
                std::fs::create_dir(db_path).unwrap();
                info!("Created databases directory.");
                let _core = Core::new()?;
                Ok(info!("Created databases."))
            }
        } else {
            warn!("Invalid argument.");
            Ok(())
        }
    } else {
        let core = Core::new()?;
        let listener = TcpListener::bind("0.0.0.0:8000").expect("Failed to listen.");
        info!("Start listening on {:?}", listener);
        run(listener, core).await;
        Ok(())
    }
}
