import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function DocsIndexPage() {
  redirect(routes.docsPage("getting-started", "introduction"));
}
