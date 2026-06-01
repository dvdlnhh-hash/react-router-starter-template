import type { Route } from "./+types/home";
import SanctuaryCraft from "../sanctuarycraft";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "SanctuaryCraft — Premium Getaway & Property Planner" },
		{ name: "description", content: "Plan, design, and launch your boutique rental property or guest experience." },
	];
}

export default function Home({}: Route.ComponentProps) {
	return <SanctuaryCraft />;
}
