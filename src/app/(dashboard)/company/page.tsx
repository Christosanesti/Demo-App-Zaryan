import { getCurrentUserWithDB } from "@/lib/auth-utils";
import CompanyClient from "./_components/CompanyClient";

export default async function CompanyPage() {
  const { userSettings } = await getCurrentUserWithDB();

  return <CompanyClient userSettings={userSettings} />;
}
