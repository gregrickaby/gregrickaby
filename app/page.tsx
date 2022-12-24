import About from "../components/About";
import Hero from "../components/Hero";
import { getAuthor, getPhotos } from "../lib/functions";

/**
 * Homepage component (server).
 *
 * @see https://beta.nextjs.org/docs/rendering/server-and-client-components
 *
 * @returns Homepage component.
 */
export default async function Homepage() {
  // Get photos from the API.
  const photos = await getPhotos();

  // Get author from the API.
  const author = await getAuthor();

  const [photosData, authorData] = await Promise.all([photos, author]);

  return (
    <>
      <Hero
        avatar={authorData.thumbnailUrl}
        bio={authorData.aboutMe}
        name={authorData.name.formatted}
        photos={photosData}
      />
      <About />
    </>
  );
}
