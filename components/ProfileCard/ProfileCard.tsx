import Image from "next/image";
import type { ProfileCardProps } from "./ProfileCard.types";

export function ProfileCard({ profile }: Readonly<ProfileCardProps>) {
  return (
    <div className="card">
      <div className="card-body bg-primary text-primary-content items-center rounded-lg text-center">
        <Image
          alt={profile.name}
          className="rounded-full"
          height={96}
          priority
          src="/icon.jpg"
          width={96}
        />
        <h1 className="card-title text-3xl font-bold">{profile.name}</h1>
        <p className="text-sm opacity-70">
          {profile.pronouns} · {profile.location}
        </p>
        <a
          href={profile.company.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link opacity-90 hover:opacity-100"
        >
          {profile.company.name}
        </a>
        <p className="mt-4 max-w-md text-lg opacity-90">{profile.bio}</p>
      </div>
    </div>
  );
}
