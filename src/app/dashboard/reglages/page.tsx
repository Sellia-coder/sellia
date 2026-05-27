import { Suspense } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import ReglagesClient from "./ReglagesClient";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ReglagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const [shop, sessions] = await Promise.all([
    db.shop.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        contactEmail: true,
        phone: true,
        whatsappNumber: true,
        address: true,
        instagramUrl: true,
        facebookUrl: true,
      },
    }),
    db.session.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        device: true,
        location: true,
      },
    }),
  ]);

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      country: true,
      city: true,
      avatarUrl: true,
      bio: true,
      twoFactorEnabled: true,
      authProvider: true,
      language: true,
      timezone: true,
      notificationPrefs: true,
    },
  });

  if (!fullUser) redirect("/connexion");

  return (
    <Suspense fallback={null}>
      <ReglagesClient
        initialTab={params.tab || "general"}
        user={{
          id: fullUser.id,
          email: fullUser.email,
          firstName: fullUser.firstName || "",
          lastName: fullUser.lastName || "",
          phone: fullUser.phone || "",
          country: fullUser.country || "CM",
          city: fullUser.city || "",
          avatarUrl: fullUser.avatarUrl || null,
          bio: fullUser.bio || "",
          language: fullUser.language || "fr",
          timezone: fullUser.timezone || "",
          twoFactorEnabled: fullUser.twoFactorEnabled || false,
          authProvider: fullUser.authProvider || "email",
          notificationPrefs:
            (fullUser.notificationPrefs as Record<string, boolean>) || {},
        }}
        shop={
          shop
            ? {
                id: shop.id,
                slug: shop.slug,
                name: shop.name,
                tagline: shop.tagline || "",
                description: shop.description || "",
                contactEmail: shop.contactEmail || "",
                phone: shop.phone || "",
                whatsappNumber: shop.whatsappNumber || "",
                address: shop.address || "",
                instagramUrl: shop.instagramUrl || "",
                facebookUrl: shop.facebookUrl || "",
              }
            : null
        }
        sessions={sessions.map((s) => ({
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          expiresAt: s.expiresAt.toISOString(),
          ipAddress: s.ipAddress || null,
          userAgent: s.userAgent || null,
          device: s.device || null,
          location: s.location || null,
        }))}
      />
    </Suspense>
  );
}
