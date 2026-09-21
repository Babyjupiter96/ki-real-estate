import { listApiKeys } from "@/lib/api-keys";
import { ApiKeysManager } from "@/components/admin/ApiKeysManager";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const keys = await listApiKeys();
  return <ApiKeysManager initialKeys={keys} />;
}
