import fs from 'fs'
import path from 'path'

export interface CarouselImage {
  alt: string
  height: number
  src: string
  width: number
}

/**
 * Build a list of images from the public/carousel folder.
 */
export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    // Get the path to the images folder.
    const imagesPath = path.join(process.cwd(), 'public/carousel')

    // Check if directory exists.
    if (!fs.existsSync(imagesPath)) {
      console.error(`Directory not found: ${imagesPath}`)
      return []
    }

    // Image file extensions to include.
    const validExtensions = ['.jpg', '.jpeg', '.avif', '.webp']

    // Read the images from the folder and filter for valid image files.
    const files = fs.readdirSync(imagesPath)
    const validFiles = files.filter((file) => {
      const extension = path.extname(file).toLowerCase()
      return validExtensions.includes(extension)
    })

    // Build the image list.
    const images: CarouselImage[] = validFiles.map((file) => {
      return {
        alt: '',
        height: 2048,
        src: `/carousel/${file}`,
        width: 2048
      }
    })

    return images
  } catch (error) {
    console.error('Error loading carousel images:', error)
    return []
  }
}
