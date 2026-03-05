mod commands;
mod models;
mod storage;

use commands::persona::{delete_persona, get_persona, list_personas, save_persona};
use commands::review::{list_reviews, save_review};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_persona,
            get_persona,
            list_personas,
            delete_persona,
            save_review,
            list_reviews,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
