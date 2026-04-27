import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WebhooksService } from "../webhooks/webhooks.service";

@Injectable()
export class SecurityAlertsService {
  private readonly logger = new Logger(SecurityAlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooks: WebhooksService,
  ) {}

  /**
   * Find every pack that lists the yanked package as a dependency and fire a
   * `package.dependency.yanked` webhook event for each affected pack's
   * subscribers. Runs fire-and-forget — never throws.
   */
  notifyDependents(
    yankedPackageId: string,
    yankedPackageFullName: string,
    yankedVersion: string,
  ): void {
    this.prisma.packageDependency
      .findMany({
        where: { depId: yankedPackageId },
        include: { pack: true },
      })
      .then((deps) => {
        for (const { pack } of deps) {
          const packFullName = `${pack.namespace}/${pack.name}`;
          this.webhooks.fireForPackage(
            "package.dependency.yanked",
            pack.id,
            packFullName,
            yankedVersion,
          );
          this.logger.log(
            `Dependency alert: ${yankedPackageFullName}@${yankedVersion} yanked — notifying ${packFullName} subscribers`,
          );
        }
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Failed to load dependents for ${yankedPackageFullName}: ${String(err)}`,
        );
      });
  }
}
