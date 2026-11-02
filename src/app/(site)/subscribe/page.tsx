import { EmailCapture } from "@/components/email-capture";
import { card, section } from "@/components/ui/styles";

export const metadata = { title: "Newsletter" };

export default function SubscribePage() {
  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Newsletter</h1>
      <p className="mb-8 text-sm text-muted">
        One mail per published post, sent from Resend. Your address is stored in Supabase and
        nowhere else, and every mail carries an unsubscribe link.
      </p>
      <div className={card()}>
        <EmailCapture
          endpoint="/api/newsletter"
          payload={{ source: "subscribe" }}
          fields={["name"]}
          cta="Subscribe"
        />
      </div>
    </div>
  );
}
