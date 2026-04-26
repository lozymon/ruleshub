import { PrismaService } from "../src/prisma/prisma.service";

export async function clearDatabase(prisma: PrismaService): Promise<void> {
  // Delete in dependency order (children before parents)
  await prisma.$transaction([
    prisma.webhookDelivery.deleteMany(),
    prisma.webhook.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.collectionItem.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.star.deleteMany(),
    prisma.packageDependency.deleteMany(),
    prisma.packageVersion.deleteMany(),
    prisma.package.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.orgMember.deleteMany(),
    prisma.organisation.deleteMany(),
    prisma.gitHubImport.deleteMany(),
    prisma.user.deleteMany(),
    prisma.emailSubscriber.deleteMany(),
  ]);
}
