use std::fs;
use std::path::{Path, PathBuf};

use serde::de::DeserializeOwned;
use serde::Serialize;

#[derive(Debug)]
pub enum StorageError {
    Io(std::io::Error),
    Json(serde_json::Error),
}

impl std::fmt::Display for StorageError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StorageError::Io(e) => write!(f, "IO error: {}", e),
            StorageError::Json(e) => write!(f, "JSON error: {}", e),
        }
    }
}

impl From<std::io::Error> for StorageError {
    fn from(e: std::io::Error) -> Self {
        StorageError::Io(e)
    }
}

impl From<serde_json::Error> for StorageError {
    fn from(e: serde_json::Error) -> Self {
        StorageError::Json(e)
    }
}

pub fn ensure_dir(path: &Path) -> Result<(), StorageError> {
    fs::create_dir_all(path)?;
    Ok(())
}

pub fn write_json<T: Serialize>(path: &PathBuf, value: &T) -> Result<(), StorageError> {
    if let Some(parent) = path.parent() {
        ensure_dir(parent)?;
    }
    let json = serde_json::to_string_pretty(value)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn read_json<T: DeserializeOwned>(path: &PathBuf) -> Result<T, StorageError> {
    let contents = fs::read_to_string(path)?;
    let value = serde_json::from_str(&contents)?;
    Ok(value)
}

pub fn list_json_files(dir: &Path) -> Result<Vec<PathBuf>, StorageError> {
    if !dir.exists() {
        return Ok(vec![]);
    }
    let entries = fs::read_dir(dir)?
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.extension().and_then(|s| s.to_str()) == Some("json"))
        .collect();
    Ok(entries)
}

pub fn delete_file(path: &PathBuf) -> Result<(), StorageError> {
    if path.exists() {
        fs::remove_file(path)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde::{Deserialize, Serialize};
    use std::fs;
    use tempfile::tempdir;

    #[derive(Debug, Serialize, Deserialize, PartialEq)]
    struct Item {
        id: String,
        value: String,
    }

    #[test]
    fn test_write_and_read_json() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.json");
        let item = Item { id: "1".into(), value: "hello".into() };

        write_json(&path, &item).unwrap();
        let loaded: Item = read_json(&path).unwrap();

        assert_eq!(item, loaded);
    }

    #[test]
    fn test_list_json_files_empty_dir() {
        let dir = tempdir().unwrap();
        let files = list_json_files(dir.path()).unwrap();
        assert!(files.is_empty());
    }

    #[test]
    fn test_list_json_files_nonexistent_dir() {
        let path = PathBuf::from("/tmp/nonexistent_dir_xyz_12345");
        let files = list_json_files(&path).unwrap();
        assert!(files.is_empty());
    }

    #[test]
    fn test_list_json_files_finds_json_files() {
        let dir = tempdir().unwrap();
        fs::write(dir.path().join("a.json"), "{}").unwrap();
        fs::write(dir.path().join("b.json"), "{}").unwrap();
        fs::write(dir.path().join("c.txt"), "text").unwrap();

        let files = list_json_files(dir.path()).unwrap();
        assert_eq!(files.len(), 2);
    }

    #[test]
    fn test_delete_file() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("to_delete.json");
        fs::write(&path, "{}").unwrap();
        assert!(path.exists());

        delete_file(&path).unwrap();
        assert!(!path.exists());
    }

    #[test]
    fn test_delete_nonexistent_file_does_not_error() {
        let path = PathBuf::from("/tmp/nonexistent_file_xyz.json");
        assert!(delete_file(&path).is_ok());
    }
}
