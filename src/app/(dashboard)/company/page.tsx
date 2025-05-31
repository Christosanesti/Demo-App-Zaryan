import { getCurrentUserWithDB } from "@/lib/auth-utils";
import CompanyClient from "./_components/CompanyClient";

export default async function CompanyPage() {
  const user = await getCurrentUserWithDB();

  if (!user) {
    return null;
  }

  return <CompanyClient userSettings={user.settings} />;
}
