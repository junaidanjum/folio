import { invoke } from '@tauri-apps/api/core'
import { useEffect, useState } from 'react'
import { resolveAssetPath } from '../lib/markdown'

type LocalImageProps = {
  alt: string
  documentPath: string | null
  source: string
}

const isDesktopApp = () => Boolean((window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)

type ImageFrameProps = {
  alt: string
  source: string | null
}

type NativeLocalImageProps = Omit<LocalImageProps, 'documentPath'> & {
  documentPath: string
}

const ImageFrame = ({ alt, source }: ImageFrameProps) => {
  const [failed, setFailed] = useState(false)

  return (
    <span className={`image-frame${failed ? ' is-missing' : ''}`}>
      <img src={source ?? undefined} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      <span className="image-error">Image unavailable · {alt || 'Untitled image'}</span>
    </span>
  )
}

const NativeLocalImage = ({ alt, documentPath, source }: NativeLocalImageProps) => {
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const resolved = resolveAssetPath(source, documentPath)
    let active = true
    const load = async () => {
      try {
        const dataUrl = await invoke<string>('read_local_image', { documentPath, imagePath: resolved })
        if (active) {
          setFailed(false)
          setImageSource(dataUrl)
        }
      } catch {
        if (active) setFailed(true)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [documentPath, source])

  return (
    <span className={`image-frame${failed ? ' is-missing' : ''}`}>
      <img src={imageSource ?? undefined} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      <span className="image-error">Image unavailable · {alt || 'Untitled image'}</span>
    </span>
  )
}

export const LocalImage = ({ alt, documentPath, source }: LocalImageProps) => {
  const resolved = resolveAssetPath(source, documentPath)
  const isLocalNativeImage = documentPath && isDesktopApp() && !/^(https?:|data:|blob:)/i.test(source)

  if (isLocalNativeImage) {
    return <NativeLocalImage key={`${documentPath}:${source}`} alt={alt} documentPath={documentPath} source={source} />
  }

  return <ImageFrame key={resolved} alt={alt} source={resolved} />
}
