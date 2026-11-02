import { EmailCapture } from "@/components/email-capture";
import { card, section } from "@/components/ui/styles";

export const metadata = { title: "Waitlist" };

export default function WaitlistPage() {
  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Waitlist</h1>
      <p className="mb-8 text-sm text-muted">
        Engagement slots open a few per quarter. Leave your details and we mail you when the next
        one frees up, with your position in line.
      </p>
      <div className={card()}>
        <EmailCapture
          endpoint="/api/leads"
          payload={{ list: "waitlist" }}
          fields={["name", "company", "note"]}
          cta="Join the waitlist"
        />
      </div>
    </div>
  );
}
