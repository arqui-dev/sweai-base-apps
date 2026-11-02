import { EmailCapture } from "@/components/email-capture";
import { card, section } from "@/components/ui/styles";

export const metadata = { title: "Early access" };

export default function EarlyAccessPage() {
  return (
    <div className={`${section()} max-w-xl`}>
      <h1 className="mb-2 text-3xl">Early access</h1>
      <p className="mb-8 text-sm text-muted">
        The platform review runs as a packaged engagement from next quarter. Early access gets the
        first cohort price and a say in the report format.
      </p>
      <div className={card()}>
        <EmailCapture
          endpoint="/api/leads"
          payload={{ list: "early-access" }}
          fields={["name", "company", "note"]}
          cta="Request early access"
        />
      </div>
      <p className="mt-6 text-xs text-muted">
        Same table as the waitlist, different list name. One migration covers every future capture
        page.
      </p>
    </div>
  );
}
