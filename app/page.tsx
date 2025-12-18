import { Links } from "@/components/Links";
import { Profile } from "@/components/Profile";
import { getProfileData } from "@/lib/services/dataService";

export default function HomePage() {
  const data = getProfileData();

  return (
    <main className="mx-auto grid max-w-lg grid-cols-1 gap-8">
      <Profile
        contact={data.contact}
        payment={data.payment}
        profile={data.profile}
        social={data.social}
      />
      <Links links={data.links} />
    </main>
  );
}
