use std::path::PathBuf;

use tauri::Manager;

use crate::models::Persona;
use crate::storage::fs::{delete_file, list_json_files, read_json, write_json};

fn personas_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path().app_data_dir().unwrap().join("personas")
}

fn persona_path(app: &tauri::AppHandle, id: &str) -> PathBuf {
    personas_dir(app).join(format!("{}.json", id))
}

#[tauri::command]
pub fn save_persona(app: tauri::AppHandle, persona: Persona) -> Result<(), String> {
    let path = persona_path(&app, &persona.id);
    write_json(&path, &persona).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_persona(app: tauri::AppHandle, id: String) -> Result<Persona, String> {
    let path = persona_path(&app, &id);
    read_json(&path).map_err(|e| format!("Persona não encontrada: {}", e))
}

#[tauri::command]
pub fn list_personas(app: tauri::AppHandle) -> Result<Vec<Persona>, String> {
    let dir = personas_dir(&app);
    let files = list_json_files(&dir).map_err(|e| e.to_string())?;
    let personas = files
        .iter()
        .filter_map(|path| read_json::<Persona>(path).ok())
        .collect();
    Ok(personas)
}

#[tauri::command]
pub fn delete_persona(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let path = persona_path(&app, &id);
    delete_file(&path).map_err(|e| e.to_string())
}
