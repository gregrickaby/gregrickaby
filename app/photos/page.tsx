import Photos from '@/components/Photos'

/**
 * Photos page.
 */
export default function Page() {
  // Current list of photos.
  const photos = [
    'https://gregrickaby.com/galleries/_1020024_Beware%20of%20Poisonous%20Snakes_20240703.avif',
    'https://gregrickaby.com/galleries/_1020031_Bowling%20Pin%20Staircase_20240703.avif',
    'https://gregrickaby.com/galleries/_1020032_Pop%21_20240703.avif',
    'https://gregrickaby.com/galleries/_1020089_Tiana%27s%20Foods_20240704.avif',
    'https://gregrickaby.com/galleries/_1020164_Monorail%20at%20Sunset_20240705.avif',
    'https://gregrickaby.com/galleries/_1020288_Slinky%20Dog%20Dash_20240706.avif',
    'https://gregrickaby.com/galleries/_1020307_Spaceship%20Earth%20at%20Sunset_20240706.avif',
    'https://gregrickaby.com/galleries/_1020308_The%20Seas%20with%20Nemo%20%26%20Friends_20240706.avif',
    'https://gregrickaby.com/galleries/_1020318_Spaceship%20Earth%20at%20Sunset_20240706.avif'
  ]

  return (
    <div>
      <h1>Photos</h1>
      <p>
        These street photos were taken during a recent trip to Walt Disney World
        on a <span className="italic">Lumix GX85</span> (with the classic{' '}
        <span className="italic">20mm f/1.7</span> lens). I took inspiration
        from Wes Anderson and applied a liberal use of orange and teal in
        Lightroom. I hope you enjoy them!
      </p>
      <div className="not-prose -mx-16 grid grid-cols-2 gap-2">
        <Photos photos={photos} />
      </div>
    </div>
  )
}
