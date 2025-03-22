import exifr from 'exifr'
import fs from 'fs'
import path from 'path'

export interface CarouselImage {
  alt: string
  height: number
  src: string
  width: number
}

/**
 * Format a filename as readable alt text
 *
 * @param filename The image filename.
 */
function formatFilenameAsAltText(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize first letter of each word
}

/**
 * Build a list of images from the public/carousel folder.
 */
export async function getCarouselImages() {
  try {
    // Get the path to the images folder.
    const imagesPath = path.join(process.cwd(), 'public/carousel')

    // Check if directory exists.
    if (!fs.existsSync(imagesPath)) {
      console.error(`Directory not found: ${imagesPath}`)
      return []
    }

    // Image file extensions to include.
    const validExtensions = ['.jpg', '.jpeg']

    // Read the images from the folder and filter for valid image files.
    const files = fs.readdirSync(imagesPath)
    const validFiles = files.filter((file) => {
      const extension = path.extname(file).toLowerCase()
      return validExtensions.includes(extension)
    })

    // Default dimensions to use as fallback.
    const DEFAULT_WIDTH = 2048
    const DEFAULT_HEIGHT = 2048

    // Process each image to extract EXIF data.
    const images: CarouselImage[] = await Promise.all(
      validFiles.map(async (image) => {
        const imagePath = path.join(imagesPath, image)
        let altText = formatFilenameAsAltText(image)
        let width = DEFAULT_WIDTH
        let height = DEFAULT_HEIGHT

        // Only attempt to read image if file exists and is readable.
        if (fs.existsSync(imagePath)) {
          try {
            // Read file to buffer first to ensure it's valid.
            const imageBuffer = fs.readFileSync(imagePath)

            // Only proceed if we have a valid buffer.
            if (imageBuffer && imageBuffer.length > 0) {
              // Try to read EXIF metadata with dimension fields.
              const metadata = await exifr.parse(imageBuffer, {
                // Include dimension-related tags.
                exif: {
                  pick: [
                    'ExifImageWidth',
                    'ExifImageHeight',
                    'ImageWidth',
                    'ImageHeight',
                    'PixelXDimension',
                    'PixelYDimension'
                  ]
                },
                tiff: {pick: ['ImageDescription', 'ImageWidth', 'ImageHeight']},
                xmp: {pick: ['Title', 'Description']},
                iptc: {pick: ['Caption', 'Headline', 'Title']},
                icc: false,
                jfif: false,
                gps: false
              })

              if (metadata) {
                // Extract dimensions from EXIF data (try multiple possible fields).
                // Only override defaults if EXIF dimensions are available.
                const exifWidth =
                  metadata.ExifImageWidth ||
                  metadata.PixelXDimension ||
                  metadata.ImageWidth

                const exifHeight =
                  metadata.ExifImageHeight ||
                  metadata.PixelYDimension ||
                  metadata.ImageHeight

                // Only use EXIF dimensions if both width and height are available.
                if (exifWidth && exifHeight) {
                  width = exifWidth
                  height = exifHeight
                }

                // Use title or description from EXIF if available.
                altText =
                  metadata.Title ||
                  metadata.ImageDescription ||
                  metadata.Description ||
                  metadata.Caption ||
                  metadata.Headline ||
                  altText // Fallback to formatted filename.
              }
            }
          } catch (error) {
            console.warn(
              `Failed to read EXIF data for ${image}: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          }
        } else {
          console.warn(`Image file not found: ${imagePath}`)
        }

        return {
          src: `/carousel/${image}`,
          alt: altText,
          width,
          height
        }
      })
    )

    return images
  } catch (error) {
    console.error('Error loading carousel images:', error)
    return []
  }
}
