import { getProfileData } from "@/lib/services/dataService";
import type { Metadata } from "next";
import Image from "next/image";
import adobeExport from "./adobe-lightroom-export-settings.jpg";
import adobeHistogram from "./adobe-lightroom-hdr-histogram-sliders.jpg";
import cinderellaCastleHDR from "./cinderella-castle-hdr.jpg";
import cinderellaCastleSDR from "./cinderella-castle-sdr.jpg";
import colorSpaceGamut from "./color-space-gamut-graph.jpg";
import davesFalls from "./daves-falls.jpg";
import hdr2012 from "./hdr-2012.jpg";
import hollywoodBlvdHdr from "./hollywood-blvd-hdr.jpg";
import hollywoodBlvdSDR from "./hollywood-blvd-sdr.jpg";
import indianaJonesHDR from "./indiana-jones-hdr.jpg";
import ratatouilleAVIF from "./ratatouille-hdr.avif";
import ratatouilleHDR from "./ratatouille-hdr.jpg";
import ratatouilleSDR from "./ratatouille-sdr.jpg";
import tronLightcycleHDR from "./tron-lightcycle-hdr.jpg";

const POST_METADATA = {
  title: "Brightening the Frame: How Gain Maps Elevate HDR Photography",
  description:
    "Explore the vibrant world of High Dynamic Range (HDR) photography enhanced by Gain Maps. Learn how modern HDR photography captures a wider range of brightness, contrast, and colors than Standard Dynamic Range.",
  shortDescription:
    "Explore the vibrant world of High Dynamic Range (HDR) photography enhanced by Gain Maps",
  publishedDate: new Date("2023-10-27T00:00:00.000Z"),
  slug: "how-gain-maps-elevate-hdr-photography",
} as const;

const profileData = getProfileData();

export const metadata: Metadata = {
  title: POST_METADATA.title,
  description: POST_METADATA.description,
  openGraph: {
    title: POST_METADATA.title,
    description: POST_METADATA.shortDescription,
    url: `${profileData.profile.url}/blog/${POST_METADATA.slug}`,
    type: "article",
    publishedTime: POST_METADATA.publishedDate.toISOString(),
    authors: [profileData.profile.name],
    images: [
      {
        url: `${profileData.profile.url}/blog/${POST_METADATA.slug}/hollywood-blvd-hdr.jpg`,
        width: 1920,
        height: 1280,
        alt: POST_METADATA.title,
      },
    ],
  },
};

export default function GainMapsHDRPhotographyPage() {
  return (
    <article className="bg-base-100 prose prose-lg mx-auto max-w-4xl rounded-sm px-8 py-12">
      <header className="mb-8">
        <div className="text-base-content/60 mb-8 flex justify-center gap-2 text-sm">
          <time dateTime={POST_METADATA.publishedDate.toISOString()}>
            {POST_METADATA.publishedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>&middot;</span>
          <span>{profileData.profile.name}</span>
        </div>
        <h1 className="mt-4 mb-8 text-center">{POST_METADATA.title}</h1>
        <p className="text-base-content/80 text-center">
          {POST_METADATA.shortDescription}
        </p>
      </header>

      <figure className="my-8">
        <Image
          src={hollywoodBlvdHdr}
          alt="Hollywood Blvd Christmas with HDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          priority
        />
        <figcaption className="text-center text-sm">
          Hollywood Blvd at Christmas | HDR (JPG) | Sony a7R IVA | Tamron
          35-150mm
        </figcaption>
      </figure>

      <p>
        High Dynamic Range (HDR) photos, displaying a wider range of brightness,
        contrast, and colors than Standard Dynamic Range (SDR), come to life on
        HDR-capable screens. With brighter highlights, detailed shadows, and
        vibrant colors, they convey a deeper sense of realism. This enhanced
        visual storytelling allows photographers to share a richer reflection of
        their experiences, capturing the essence of the moment.
      </p>

      <h2>A Brief History</h2>

      <p>
        For many years there have been two other types of &quot;HDR&quot; in
        photography. The over-the-top saturated photos from 2012:
      </p>

      <figure className="my-8">
        <Image
          src={hdr2012}
          alt="An oversaturated and overly darkened HDR image from 2012"
          className="m-auto rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          An oversaturated and overly darkened &quot;HDR&quot; image from 2012
        </figcaption>
      </figure>

      <p>
        To modern photos captured via exposure bracketing and merged using a
        technique called HDR photo merge:
      </p>

      <figure className="my-8">
        <Image
          src={davesFalls}
          alt="Dave's Falls in Amberg Wisconsin"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          An HDR photo merge using Adobe Lightroom | Sony a7R IVA | Tamron
          35-150mm
        </figcaption>
      </figure>

      <p>
        This post is not about those HDR pretenders though, because at the end
        of the day: the two photos above only have 8 bits worth of data and are
        in the sRGB colorspace.
      </p>

      <p>
        This post is about true High Dynamic Range photos, which are in a larger
        colorspace and are shown at a much higher luminance.
      </p>

      <h2>The Need For More Nits and Bits</h2>

      <p>
        Most images on the web only contain 8 bits worth of information and are
        in the sRGB color space. That&apos;s strictly a technical limitation of
        older web-based image formats like .jpg. But did you know that cameras
        have been capturing RAW photos with more than 8 bits (and in larger
        colorspace) going back 20+ years!?
      </p>

      <figure className="my-8">
        <Image
          src={colorSpaceGamut}
          alt="A graph plotting various color spaces and how they relate to the visible color spectrum"
          className="m-auto rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          A graph plotting various color spaces and how they relate to the
          visible color spectrum
        </figcaption>
      </figure>

      <p>
        The problem was that there was no practical way to &quot;work&quot; with
        those extra bits (or even view them on a display). So .jpg and PNG
        images simply discard everything &quot;extra&quot; to maximize
        compression back when the data on the Internet was sent over copper.
      </p>

      <p>
        Fast forward to today, where the Internet is fast, and HDR-capable
        displays are everywhere (smartphones, tablets, TVs, and laptops). Not
        only can these devices render all the colors contained in larger color
        spaces like DCI-P3, Adobe RGB, Rec.2020 colorspaces, but they also have
        many times the peak brightness as SDR displays giving us the ability to
        view HDR content. Additionally, emerging image formats like AVIF and
        JPEG XL can hold more bits and retain high quality thanks to modern
        compression algorithms.
      </p>

      <p>
        For example, the iPhone 16 Pro supports 1,200 nits (HDR) of brightness
        and 2,000 nits (outdoors). The current MacBook Pros can support 1,600
        nits for HDR content. In comparison, the best-selling LCD monitor on
        Amazon only supports 250 nits.
      </p>

      <p>
        Even though modern displays have the ability to display true HDR photos,
        and that data already present in RAW files, the missing link has been a
        photo editor capable of editing in true HDR.
      </p>

      <h2>Adobe To The Rescue</h2>

      <p>
        In October 2022, Adobe released a technology preview of their High
        Dynamic Range Output in Adobe Camera Raw. This preview allowed
        Photographers to experiment with exporting images greater than 8-bit and
        viewing them on HDR-supported displays. The workflow was a bit
        cumbersome though and browser support was lacking, so for the last year,
        there wasn&apos;t much you could do with your HDR photos except view
        them on your own computer.
      </p>

      <p>
        In October 2023, Adobe released a new version of Lightroom Classic that
        brought full support for editing and displaying HDR photos. Finally, the
        missing link has been found!
      </p>

      <figure className="my-8">
        <Image
          src={adobeHistogram}
          alt="A screenshot of Adobe's new HDR histogram and sliders"
          className="m-auto rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          A screenshot of Adobe Lightroom Classic&apos;s new HDR histogram and
          sliders
        </figcaption>
      </figure>

      <h2>What Are Gain Maps?</h2>

      <p>
        Without getting too technical, a gain map is a tool in image processing
        used to adjust the intensity or brightness of an image. It&apos;s a
        matrix of values that, when applied, multiply the original pixel values
        to brighten or darken different areas of the image independently. This
        allows improved shadow and highlight rendering and preparing images for
        further analysis in applications like medical imaging and machine vision
        systems.
      </p>

      <p>
        If you want to deep dive into the technical side, check out Adobe&apos;s{" "}
        <a
          href="https://helpx.adobe.com/camera-raw/using/gain-map.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          full spec
        </a>{" "}
        and visit Greg Benz&apos;s website to learn all about the{" "}
        <a
          href="https://gregbenzphotography.com/hdr-images/jpg-hdr-gain-maps-in-adobe-camera-raw/"
          target="_blank"
          rel="noopener noreferrer"
        >
          technical details
        </a>
        .
      </p>

      <h2>Ok, Gain Maps sound interesting. So what?</h2>

      <p>
        If a user&apos;s web browser can read a Gain Map and the device
        they&apos;re viewing with can display it, the user will see the full HDR
        version of the photo you&apos;re sharing. Otherwise, the web browser
        will automatically revert to the standard SDR version. This advancement
        means that as a photographer, you can export a single image today with
        support for both HDR and SDR, saving you from additional work in the
        future.
      </p>

      <figure className="my-8">
        <Image
          src={adobeExport}
          alt="A screenshot of Adobe Lightroom's export settings to enable a Gain Map"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          A screenshot of Adobe Lightroom&apos;s export settings to enable a
          Gain Map
        </figcaption>
      </figure>

      <h2>Examples</h2>

      <p>
        While on vacation at Disney World, I snapped this photo while in the
        queue for Remy&apos;s Ratatouille Adventure at EPCOT. (BTW: I love this
        scene because who wouldn&apos;t want to have a studio space this
        lovely?)
      </p>

      <p>This first image is a regular &apos;ol JPG right out of Lightroom:</p>

      <figure className="my-8">
        <Image
          src={ratatouilleSDR}
          alt="Remy's Ratatouille Adventure SDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          SDR (JPG) | Sony a7R IVA | Sony 16-35mm PZ | 1/160 sec, f/4, ISO 10000
        </figcaption>
      </figure>

      <p>
        Here is the same image, edited with Lightroom&apos;s new HDR sliders and
        exported as a JPG with a Gain Map:
      </p>

      <figure className="my-8">
        <Image
          src={ratatouilleHDR}
          alt="Remy's Ratatouille Adventure - HDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          HDR (JPG) | Sony a7R IVA | Sony 16-35mm PZ | 1/160 sec, f/4, ISO 10000
        </figcaption>
      </figure>

      <p>
        The difference is subtle, the light from the lamps is not only brighter
        but there&apos;s also no banding. Remy&apos;s chef hat is a brilliant
        white– and matches what I saw in person, not a dull shade of blue.
      </p>

      <p>
        Finally, here is the same image exported as an AVIF with a Gain Map:
      </p>

      <figure className="my-8">
        <Image
          src={ratatouilleAVIF}
          alt="Remy's Ratatouille Adventure - HDR with SDR fallback (AVIF)"
          className="rounded-lg"
          width={1920}
          height={1080}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          HDR (AVIF) | Sony a7R IVA | Sony 16-35mm PZ | 1/160 sec, f/4, ISO
          10000
        </figcaption>
      </figure>

      <p>
        If all three of the images look the same, it&apos;s because you may have
        an incompatible web browser or a non-HDR display. But that&apos;s the
        beauty of Gain Maps! You can still see the SDR version because it is
        baked right into the same file!
      </p>

      <p>
        This next example is one of my favorite photos: Christmas at Hollywood
        Studios on Hollywood Boulevard. With all the decorations and lights, the
        neon, sounds, smells, dramatic clouds overhead. This moment was
        electric!!
      </p>

      <figure className="my-8">
        <Image
          src={hollywoodBlvdSDR}
          alt="Hollywood Boulevard Christmas SDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          SDR (JPG) | Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 640
        </figcaption>
      </figure>

      <p>
        Unfortunately, the SDR version does not do this scene justice. It simply
        fails to fully capture the brilliance and the ambiance of standing on
        Hollywood Boulevard at Christmas time.
      </p>

      <p>
        The HDR version does a much better job though! It is a much closer
        representation of what my eye saw and how I felt at that moment. As a
        photographer, isn&apos;t that exactly what we&apos;re trying to do?
      </p>

      <figure className="my-8">
        <Image
          src={hollywoodBlvdHdr}
          alt="Christmas at Hollywood Studios on Hollywood Boulevard"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          HDR (JPG) | Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 640
        </figcaption>
      </figure>

      <p>
        Here&apos;s a photo of Cinderella&apos;s Castle right before the
        fireworks. The SDR version captures the various shades of purples being
        projected onto the castle. It&apos;s just okay though.
      </p>

      <figure className="my-8">
        <Image
          src={cinderellaCastleSDR}
          alt="Cinderella's Castle 50th Anniversary SDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          SDR (JPG) | Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 2500
        </figcaption>
      </figure>

      <p>And here is the HDR version…</p>

      <figure className="my-8">
        <Image
          src={cinderellaCastleHDR}
          alt="Cinderella's Castle 50th Anniversary HDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          HDR (JPG) | Sony a7R IVA | Tamron 35-150mm | 1/40 sec, f/2, ISO 2500
        </figcaption>
      </figure>

      <p>
        Even at a higher ISO, Lightroom&apos;s HDR workflow is able to bring up
        the vibrance of the street lamps, the back-lit &quot;50&quot; on the
        front of the castle, and reduces the banding in the shades of purple. It
        took an &quot;okay&quot; photo and made it a bit more interesting.
      </p>

      <h2>Too Much of a Good Thing</h2>

      <p>
        It&apos;s very easy to overdo it with the HDR &quot;highlights&quot; and
        &quot;whites&quot; sliders in Lightroom, as I did in this photo from
        Indiana Jones™️ Epic Stunt Spectacular. I cranked it to eleven!
      </p>

      <figure className="my-8">
        <Image
          src={indianaJonesHDR}
          alt="Indiana Jones Epic Stunt Spectacular HDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          HDR (JPG) | Sony a7R IVA | Tamron 35-150mm | 1/1250 sec, f/4, ISO 160
        </figcaption>
      </figure>

      <p>
        If you&apos;re not careful, your photo may end up looking unrealistic
        and overly processed (like those terrible &quot;HDR&quot; images from
        2012). My recommendation would be to keep your editing tasteful so you
        don&apos;t blind your viewers!
      </p>

      <h2>But Can I Print in HDR?</h2>

      <p>
        Sadly, no. This is a physical limitation, not a technical one. We simply
        can&apos;t make photo paper any brighter, the same way an HDR display
        can increase the brightness of individual pixels.
      </p>

      <h2>This Sounds Cool, Tell Me About Browser / App / CMS Support</h2>

      <p>
        The short answer is software is still catching up to the hardware. As of
        fall 2024…
      </p>

      <h3>Photo Editors</h3>

      <ul>
        <li>
          Newer versions of Adobe Photoshop, Lightroom, and Camera Raw have full
          support for editing (and exporting) images that include a Gain Map in
          either P3 or Rec.2020 color spaces.
        </li>
        <li>
          Affinity Photo also supports Gain Maps (but they call it tone mapping)
        </li>
        <li>iOS Photos App supports Gain Maps</li>
      </ul>

      <h3>Image Formats</h3>

      <ul>
        <li>JPG (best browser support)</li>
        <li>
          AVIF (an emerging format with good browser support and better
          compression than JPG)
        </li>
        <li>HEIF (another emerging format, but limited browser support)</li>
        <li>
          JPEG XL (was a dead format, but Apple is trying to bring it back)
        </li>
      </ul>

      <h3>Web browsers</h3>

      <ul>
        <li>
          Chrome-based web browsers (Chrome, Edge, Brave) on version 116+ have
          full support.
        </li>
        <li>Opera has full support.</li>
        <li>
          Safari support is presumably on the way? (iOS 17 Photos app now has
          support for Gain Maps and iOS 18 brought HDR support to messages and
          the camera app)
        </li>
        <li>
          Firefox is unknown at this time, but there has been a bug report
          filed.
        </li>
      </ul>

      <h3>Social Media</h3>

      <ul>
        <li>Instagram and Threads support Gain Maps and HDR photos</li>
        <li>Facebook does not</li>
      </ul>

      <h3>Content Management Systems</h3>

      <ul>
        <li>
          WordPress, the web&apos;s most popular CMS, fully supports Gain Maps.
        </li>
      </ul>

      <h3>HDR Capable Displays</h3>

      <ul>
        <li>MacBook Pro&apos;s, starting with the M1</li>
        <li>
          Smartphones and tablets, including iPhone, iPad, Samsung Galaxy, and
          Google Pixel
        </li>
        <li>Apple XDR Pro display</li>
        <li>
          Modern TVs or monitors that support HDR10, HDR10+, HLG, and Dolby
          Vision
        </li>
      </ul>

      <h2>Wrap Up</h2>

      <figure className="my-8">
        <Image
          src={tronLightcycleHDR}
          alt="Tron Lightcycle Run at Magic Kingdom in HDR"
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 896px"
          loading="lazy"
        />
        <figcaption className="text-center text-sm">
          Tron Lightcycle Run at Magic Kingdom | HDR (JPG) | Sony a7R IVA |
          Tamron 35-150mm | 1/40 sec, f/2, ISO 2500
        </figcaption>
      </figure>

      <p>
        The journey of HDR, from its early exaggerated renditions to its now
        more nuanced and true-to-life representations, truly showcases the
        remarkable path of photographic evolution. With technology finally
        catching up to the nuances of human vision, photographers are now
        equipped with tools that break past previous digital boundaries. The
        increasing support for HDR and Gain Maps across various platforms and
        software is a testament to the evolving landscape of digital
        photography.
      </p>

      <p>
        Whether you are a professional photographer or a hobbyist, the realm of
        HDR opens up a canvas of possibilities, enabling a more authentic
        translation of our visual experiences. I will definitely be using
        Lightroom&apos;s new HDR workflow going forward.
      </p>

      <p>Thanks for reading and cheers! 📸</p>
    </article>
  );
}
