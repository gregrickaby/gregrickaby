// https://nextjs.org/docs/api-routes/edge-api-routes
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function photos(req: NextRequest) {
  try {
    // Attempt to fetch all photos from Cloudinary.
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

    // Bad response? Bail...
    if (response.status != 200) {
      return new Response(
        JSON.stringify({
          error: `${response.statusText}`,
        }),
        {
          status: response.status,
          statusText: response.statusText,
        }
      );
    }

    // Get the response body.
    const allPhotos = response.json;

    // Return all the photos.
    return new Response(JSON.stringify(allPhotos), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
      status: 200,
      statusText: "OK",
    });
  } catch (error) {
    // Issue? Leave a message and bail.
    console.error(error);
    return new Response(JSON.stringify({ error: `${error}` }), {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
