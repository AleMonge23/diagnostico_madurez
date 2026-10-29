import { createFileRoute } from "@tanstack/react-router";
import { DiagnosticApp } from "@/components/meridiano/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DiagnosticApp />;
}
