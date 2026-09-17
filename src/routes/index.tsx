import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/sage/desk";
import { fetchLastPack } from "@/lib/edition";

export const Route = createFileRoute("/")({
  loader: () => fetchLastPack(),
  staleTime: 30_000,
  component: Home,
});

function Home() {
  const seed = Route.useLoaderData();
  return <Desk seed={seed} />;
}
