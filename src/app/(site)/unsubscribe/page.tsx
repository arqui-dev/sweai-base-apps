import { UnsubscribeConfirm } from "./unsubscribe-confirm";
import { card, section } from "@/components/ui/styles";

export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const params = await searchParams;
  const email = typeof params.e === "string" ? params.e : "";
  const token = typeof params.t === "string" ? params.t : "";

  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Unsubscribe</h1>

      {email && token ? (
        <>
          <p className="mb-8 text-sm text-muted">
            One click and <strong>{email}</strong> stops receiving the newsletter. Premium access
            you paid for is unaffected.
          </p>
          <div className={card()}>
            <UnsubscribeConfirm email={email} token={token} />
          </div>
        </>
      ) : (
        <p className={card()}>
          This page needs the signed link from the footer of any newsletter we sent you. Open the
          most recent one and click Unsubscribe there.
        </p>
      )}
    </div>
  );
}
