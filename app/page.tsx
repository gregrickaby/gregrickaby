import About from "../components/About";
import Hero from "../components/Hero";
import { getPhotos } from "../lib/functions";

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

  return (
    <>
      <Hero {...photos} />
      <About />
    </>
  );
}
