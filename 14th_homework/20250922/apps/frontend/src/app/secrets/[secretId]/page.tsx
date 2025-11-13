import SecretDetail from "@/components/secrets-detail/SecretDetail";
import { fetchSecretById } from "@/components/secrets-list/queries";
import { notFound } from "next/navigation";

type SecretDetailPageProps = {
	params: { secretId: string };
};

export default async function SecretDetailPage({ params }: SecretDetailPageProps) {
	const secretData = await fetchSecretById(params.secretId);

	if (!secretData) {
		notFound();
	}

	return <SecretDetail data={secretData} />;
}


