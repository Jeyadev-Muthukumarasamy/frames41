import type { ProductCustomizationConfig } from '../../types/productDetail'
import { formatINR } from '../../utils/format'

interface Props {
  config: ProductCustomizationConfig
  images: File[]
  names: string[]
  date: string
  songName: string
  qrCodeImages: File[]
  error?: string
  onImagesChange: (files: File[]) => void
  onNamesChange: (names: string[]) => void
  onDateChange: (value: string) => void
  onSongNameChange: (value: string) => void
  onQrCodeImagesChange: (files: File[]) => void
}

function FileList({ files }: { files: File[] }) {
  if (files.length === 0) return null
  return (
    <ul className="mt-2 space-y-1 text-xs text-primary">
      {files.map((file, index) => (
        <li key={`${file.name}-${file.lastModified}-${index}`} className="truncate">
          {index + 1}. {file.name}
        </li>
      ))}
    </ul>
  )
}

export default function CustomerCustomizationForm({
  config,
  images,
  names,
  date,
  songName,
  qrCodeImages,
  error,
  onImagesChange,
  onNamesChange,
  onDateChange,
  onSongNameChange,
  onQrCodeImagesChange,
}: Props) {
  const hasInputs =
    config.numberOfImages.enabled ||
    config.numberOfNames.enabled ||
    config.date.enabled ||
    config.songName.enabled ||
    config.qrCodeImages.enabled ||
    config.startingFrom.enabled

  if (!hasInputs) return null

  return (
    <section className="space-y-4 rounded-xl border border-outline-variant bg-white p-4 sm:p-5">
      <div>
        <h2 className="font-bold text-on-background">Personalise this product</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Complete the required details below.</p>
      </div>

      {config.startingFrom.enabled && config.startingFrom.amount !== undefined && (
        <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
          Starting from {formatINR(config.startingFrom.amount)}
        </p>
      )}

      {config.numberOfImages.enabled && (
        <label className="block text-sm font-bold text-on-background">
          Upload {config.numberOfImages.count} image{config.numberOfImages.count === 1 ? '' : 's'} *
          <input
            type="file"
            multiple={config.numberOfImages.count > 1}
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              onImagesChange(Array.from(event.target.files ?? []).slice(0, config.numberOfImages.count))
            }
            className="mt-2 block w-full rounded-lg border border-outline-variant p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
          />
          <span className="mt-1 block text-xs font-normal text-on-surface-variant">
            {images.length} of {config.numberOfImages.count} selected
          </span>
          <FileList files={images} />
        </label>
      )}

      {config.numberOfNames.enabled && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-on-background">
            Enter {config.numberOfNames.count} name{config.numberOfNames.count === 1 ? '' : 's'} *
          </p>
          {Array.from({ length: config.numberOfNames.count }, (_, index) => (
            <input
              key={index}
              value={names[index] ?? ''}
              maxLength={100}
              placeholder={`Name ${index + 1}`}
              onChange={(event) => {
                const next = Array.from({ length: config.numberOfNames.count }, (_, i) => names[i] ?? '')
                next[index] = event.target.value
                onNamesChange(next)
              }}
              className="w-full rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          ))}
        </div>
      )}

      {config.date.enabled && (
        <label className="block text-sm font-bold text-on-background">
          Date *
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
      )}

      {config.songName.enabled && (
        <label className="block text-sm font-bold text-on-background">
          Name of the song *
          <input
            value={songName}
            maxLength={200}
            onChange={(event) => onSongNameChange(event.target.value)}
            placeholder="Enter the song name"
            className="mt-2 block w-full rounded-lg border border-outline-variant bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
      )}

      {config.qrCodeImages.enabled && (
        <label className="block text-sm font-bold text-on-background">
          Upload {config.qrCodeImages.count} QR code image{config.qrCodeImages.count === 1 ? '' : 's'} *
          <input
            type="file"
            multiple={config.qrCodeImages.count > 1}
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              onQrCodeImagesChange(Array.from(event.target.files ?? []).slice(0, config.qrCodeImages.count))
            }
            className="mt-2 block w-full rounded-lg border border-outline-variant p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-bold file:text-primary"
          />
          <span className="mt-1 block text-xs font-normal text-on-surface-variant">
            {qrCodeImages.length} of {config.qrCodeImages.count} selected
          </span>
          <FileList files={qrCodeImages} />
        </label>
      )}

      {error && <p role="alert" className="text-sm font-medium text-error">{error}</p>}
    </section>
  )
}
