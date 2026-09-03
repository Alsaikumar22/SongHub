import { redirect } from "next/navigation";

export default async function LandingPage({ searchParams }) {
  const params = await searchParams;

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) value.forEach((v) => query.append(key, v));
      else if (value !== undefined && value !== null) query.set(key, String(value));
    }
    redirect(`/home?${query.toString()}`);
  }

  redirect("/home");
}
