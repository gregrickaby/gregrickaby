"use client";
import cx from "classnames";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./hero.module.css";

/**
 * Hero component. (client)
 *
 * @see https://beta.nextjs.org/docs/rendering/server-and-client-components
 * @param photos
 * @returns The hero component.
 */
export default function Hero(photos: any) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setInterval(() => {
      // Get a random number between 0 and the total number of photos.
      const i = Math.floor(Math.random() * photos.total_count);
      setVisible(i);
    }, 8000);
  }, [photos.total_count]);

  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        {photos.resources.map((photo: any, index: number) => {
          return (
            <Image
              alt=""
              className={cx(styles.image, visible !== index && styles.hidden)}
              height={1080}
              key={photo.public_id}
              src={photo.secure_url}
              width={1920}
            />
          );
        })}
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Greg Rickaby</h1>
        <p className={styles.subtitle}>
          Tech Lead at AmericanEagle.com. Published Author. Photographer.
        </p>
        <button
          className={styles.button}
          onClick={() => {
            // @ts-ignore
            document
              .getElementById("about")
              .scrollIntoView({ behavior: "smooth" });
          }}
        >
          About
        </button>
      </div>
    </section>
  );
}
