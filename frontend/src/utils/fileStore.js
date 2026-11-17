const STORAGE_KEY = 'orbita_import_files'

export function getFiles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch (error) {
    return []
  }
}

export function addFile(file) {
  const files = getFiles()
  files.unshift(file)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  return files
}

export function removeFile(id) {
  const files = getFiles().filter((file) => file.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  return files
}

export function clearFiles() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}
