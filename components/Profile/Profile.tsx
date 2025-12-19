import avatar from "@/app/icon.jpg";
import { DynamicIcon } from "@/components/DynamicIcon";
import { IconModal } from "@/components/IconModal";
import cover from "@/public/cover.jpg";
import Image from "next/image";
import type { ProfileProps } from "./Profile.types";

export function Profile({
  profile,
  contact,
  payment,
  social,
}: Readonly<ProfileProps>) {
  return (
    <section className="card card-lg rounded-lg shadow-lg">
      <div className="relative h-40">
        <Image
          alt=""
          className="h-full w-full rounded-t-lg object-cover"
          height={160}
          placeholder="blur"
          preload
          role="presentation"
          src={cover}
          width={512}
        />

        <div className="avatar absolute -bottom-10 left-5">
          <figure className="w-24 rounded-full shadow-md">
            <Image
              alt={profile.name}
              height={96}
              placeholder="blur"
              preload
              src={avatar}
              width={96}
            />
          </figure>
        </div>
      </div>

      <div className="card-body from-base-100 to-base-300 gap-4 rounded-b-lg bg-linear-to-r/oklch to-100% pt-14 pb-6">
        <div className="space-y-1">
          <h2 className="card-title mb-2 text-4xl text-shadow-xs">
            {profile.name}
          </h2>
          <p className="text-base-content/70">
            <a
              data-umami-event="click-company-link"
              href={profile.company.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {profile.company.role}, {profile.company.name}
            </a>
          </p>
          <p className="text-base-content/70">
            {profile.pronouns} <span className="px-2">·</span>{" "}
            {profile.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DynamicIcon
            aria-label="Verified badge"
            className="text-info"
            name="MdVerified"
          />{" "}
          —
          {social.map((item) => (
            <a
              aria-label={item.name}
              data-umami-event={`click-social-${item.name.toLowerCase().replaceAll(" ", "-")}`}
              href={item.url}
              key={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <DynamicIcon
                aria-label={item.name}
                className="transition-transform duration-100 ease-in-out hover:scale-140"
                name={item.icon}
              />
            </a>
          ))}
        </div>

        <p className="text-base-content/80 text-lg leading-relaxed">
          {profile.bio}
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
          <IconModal
            buttonText="Contact"
            items={contact}
            modalTitle="Contact"
          />
          <IconModal
            buttonText="Payments"
            items={payment}
            modalTitle="Payments"
          />
        </div>
      </div>
    </section>
  );
}
