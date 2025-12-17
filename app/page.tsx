import { ProfileCard } from "@/components/ProfileCard";
import { IconModal } from "@/components/IconModal";
import { LinkCard } from "@/components/LinkCard";
import { IconButton } from "@/components/IconButton";
import { getProfileData } from "@/lib/services/dataService";

export default function HomePage() {
  const data = getProfileData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <ProfileCard profile={data.profile} />
        <div className="flex gap-3">
          <IconModal
            items={data.contact}
            buttonText="Contact"
            modalTitle="Contact"
          />
          <IconModal
            items={data.payment}
            buttonText="Payments"
            modalTitle="Payments"
          />
        </div>
        {data.links.length > 0 && (
          <section className="w-full space-y-4">
            {data.links.map((link) => (
              <LinkCard key={link.url} link={link} />
            ))}
          </section>
        )}
        {data.social.length > 0 && (
          <section className="w-full">
            <div className="flex justify-center gap-4">
              {data.social.map((social) => (
                <IconButton
                  key={social.url}
                  icon={social.icon}
                  name={social.name}
                  url={social.url}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
