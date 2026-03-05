use std::path::PathBuf;

use tauri::Manager;

use crate::models::Review;
use crate::storage::fs::{list_json_files, read_json, write_json};

fn reviews_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("reviews")
}

fn review_path(app: &tauri::AppHandle, id: &str) -> PathBuf {
    reviews_dir(app).join(format!("{}.json", id))
}

#[tauri::command]
pub fn save_review(app: tauri::AppHandle, review: Review) -> Result<(), String> {
    let path = review_path(&app, &review.id);
    write_json(&path, &review).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_reviews(app: tauri::AppHandle, persona_id: String) -> Result<Vec<Review>, String> {
    let dir = reviews_dir(&app);
    let files = list_json_files(&dir).map_err(|e| e.to_string())?;
    let reviews = files
        .iter()
        .filter_map(|path| read_json::<Review>(path).ok())
        .filter(|r: &Review| r.persona_id == persona_id)
        .collect();
    Ok(reviews)
}
