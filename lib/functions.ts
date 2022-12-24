/**
 * Get all photos from Cloudinary.
 *
 * @returns {Promise} A promise that resolves to an array of photos.
 */
export async function getPhotos() {
  try {
    // Fetch all photos from Cloudinary.
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_API_CLOUD_NAME}/resources/search`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa(
              `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`
            ),
        },
      }
    );

    // If the response is not OK, throw an error.
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // Return the response as JSON.
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function getAuthor() {
  try {
    const response = await fetch(
      `https://www.gravatar.com/28af3e39c0a1fe4c31367c7e9a8bcac3.json`
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    return data.entry[0];
  } catch (error) {
    console.error(error);
  }
}
