import { InfrastructureGraph } from "@/components/topology/infrastructure-graph";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0C] p-6 md:p-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white glow-text">
          OmniScale
        </h1>
        <p className="text-cyan-400/60 text-sm mt-1 tracking-wide">
          Mapa infrastruktury chmurowej — środowisko: production
        </p>
      </header>

      <InfrastructureGraph />
    </main>
  );
}