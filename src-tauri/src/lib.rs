use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use notify::{EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::{
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

struct WatcherState(Mutex<Option<RecommendedWatcher>>);
struct PendingFileState(Mutex<Option<String>>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct MarkdownFile {
    content: String,
    name: String,
    path: String,
}

fn validate_markdown_path(path: &Path) -> Result<(), String> {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    if !matches!(extension.to_ascii_lowercase().as_str(), "md" | "markdown") {
        return Err("Folio can only open .md and .markdown files.".into());
    }
    Ok(())
}

#[tauri::command]
fn read_markdown_file(path: String) -> Result<MarkdownFile, String> {
    let canonical = PathBuf::from(&path)
        .canonicalize()
        .map_err(|error| error.to_string())?;
    validate_markdown_path(&canonical)?;
    let metadata = canonical.metadata().map_err(|error| error.to_string())?;
    if metadata.len() > 20 * 1024 * 1024 {
        return Err("This Markdown file is larger than the 20 MB safety limit.".into());
    }
    let content = std::fs::read_to_string(&canonical).map_err(|error| error.to_string())?;
    let name = canonical
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("Untitled.md")
        .to_string();
    Ok(MarkdownFile {
        content,
        name,
        path: canonical.to_string_lossy().to_string(),
    })
}

fn image_mime_type(path: &Path) -> Result<&'static str, String> {
    match path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "png" => Ok("image/png"),
        "jpg" | "jpeg" => Ok("image/jpeg"),
        "gif" => Ok("image/gif"),
        "webp" => Ok("image/webp"),
        _ => Err("Unsupported local image format.".into()),
    }
}

#[tauri::command]
fn read_local_image(document_path: String, image_path: String) -> Result<String, String> {
    const MAX_IMAGE_BYTES: u64 = 20 * 1024 * 1024;

    let document = PathBuf::from(document_path)
        .canonicalize()
        .map_err(|error| error.to_string())?;
    validate_markdown_path(&document)?;
    let document_directory = document
        .parent()
        .ok_or("The document directory is unavailable.")?;
    let image = PathBuf::from(image_path)
        .canonicalize()
        .map_err(|error| error.to_string())?;
    if !image.starts_with(document_directory) {
        return Err("Images must be inside the Markdown document directory.".into());
    }

    let mime = image_mime_type(&image)?;

    let metadata = image.metadata().map_err(|error| error.to_string())?;
    if metadata.len() > MAX_IMAGE_BYTES {
        return Err("This image is larger than the 20 MB safety limit.".into());
    }

    let bytes = std::fs::read(image).map_err(|error| error.to_string())?;

    Ok(format!("data:{mime};base64,{}", BASE64.encode(bytes)))
}

#[tauri::command]
fn watch_markdown_file(
    app: tauri::AppHandle,
    state: State<WatcherState>,
    path: String,
) -> Result<(), String> {
    let canonical = PathBuf::from(path)
        .canonicalize()
        .map_err(|error| error.to_string())?;
    validate_markdown_path(&canonical)?;
    let watched_path = canonical.clone();
    let change_generation = Arc::new(AtomicU64::new(0));
    let mut watcher = notify::recommended_watcher(move |result: notify::Result<notify::Event>| {
        if let Ok(event) = result {
            if matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_))
                && event.paths.iter().any(|path| path == &watched_path)
            {
                let app_handle = app.clone();
                let changed_path = watched_path.to_string_lossy().to_string();
                let generation_counter = Arc::clone(&change_generation);
                let generation = generation_counter.fetch_add(1, Ordering::Relaxed) + 1;
                std::thread::spawn(move || {
                    std::thread::sleep(Duration::from_millis(140));
                    if generation_counter.load(Ordering::Relaxed) == generation {
                        let _ = app_handle.emit("markdown-changed", changed_path);
                    }
                });
            }
        }
    })
    .map_err(|error| error.to_string())?;
    watcher
        .watch(
            canonical
                .parent()
                .ok_or("The document directory is unavailable.")?,
            RecursiveMode::NonRecursive,
        )
        .map_err(|error| error.to_string())?;
    *state.0.lock().map_err(|_| "File watcher lock failed")? = Some(watcher);
    Ok(())
}

#[tauri::command]
fn initial_file(state: State<PendingFileState>) -> Result<Option<String>, String> {
    Ok(state
        .0
        .lock()
        .map_err(|_| "Pending file lock failed")?
        .take())
}

#[tauri::command]
fn print_document(window: tauri::WebviewWindow) -> Result<(), String> {
    window.print().map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(WatcherState(Mutex::new(None)))
        .manage(PendingFileState(Mutex::new(std::env::args().skip(1).find(
            |argument| validate_markdown_path(Path::new(argument)).is_ok(),
        ))))
        .invoke_handler(tauri::generate_handler![
            read_markdown_file,
            read_local_image,
            watch_markdown_file,
            initial_file,
            print_document
        ])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("Folio");
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Folio")
        .run(|_app, _event| {
            #[cfg(any(target_os = "macos", target_os = "ios"))]
            if let tauri::RunEvent::Opened { urls } = _event {
                let path = urls
                    .iter()
                    .filter_map(|url| url.to_file_path().ok())
                    .find(|path| validate_markdown_path(path).is_ok());
                if let Some(path) = path {
                    let state = _app.state::<PendingFileState>();
                    if let Ok(mut pending) = state.0.lock() {
                        *pending = Some(path.to_string_lossy().into_owned());
                    }
                    let _ = _app.emit("markdown-open-requested", ());
                    if let Some(window) = _app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.unminimize();
                        let _ = window.set_focus();
                    }
                }
            }
        });
}

#[cfg(test)]
mod tests {
    use super::{image_mime_type, validate_markdown_path};
    use std::path::Path;

    #[test]
    fn accepts_supported_markdown_extensions_case_insensitively() {
        assert!(validate_markdown_path(Path::new("notes.md")).is_ok());
        assert!(validate_markdown_path(Path::new("notes.MARKDOWN")).is_ok());
        assert!(validate_markdown_path(Path::new("notes.txt")).is_err());
    }

    #[test]
    fn accepts_only_raster_image_formats() {
        assert_eq!(
            image_mime_type(Path::new("image.PNG")).unwrap(),
            "image/png"
        );
        assert_eq!(
            image_mime_type(Path::new("image.jpeg")).unwrap(),
            "image/jpeg"
        );
        assert!(image_mime_type(Path::new("image.svg")).is_err());
    }
}
