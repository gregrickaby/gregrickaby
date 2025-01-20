/**
 * Format the camera name to a more human-readable format.
 */
export function formatCameraName(camera: string) {
  switch (camera) {
    case 'ILCE-7RM4A':
      return 'Sony α7R IVA'
    case 'ILCE-6700':
      return 'Sony α6700'
    case 'DMC-G81':
      return 'Panasonic Lumix G85'
    case 'DMC-GX85':
      return 'Panasonic Lumix GX85'
    case 'DC-G9':
      return 'Panasonic Lumix G9'
  }
}
