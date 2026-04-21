import { notFound } from 'next/navigation';
import { getUser } from '@/lib/api/users';
import { searchPackages } from '@/lib/api/packages';
import { PackageCard } from '@/components/packages/package-card';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  let user;
  try {
    user = await getUser(username);
  } catch {
    notFound();
  }

  const { data: packages } = await searchPackages({ q: username });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        {user.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {user.verified && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                Verified
              </span>
            )}
          </div>
          {user.bio && <p className="text-muted-foreground mt-1">{user.bio}</p>}
          <p className="text-sm text-muted-foreground mt-1">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Packages</h2>
      {packages.length === 0 ? (
        <p className="text-muted-foreground">No packages published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
