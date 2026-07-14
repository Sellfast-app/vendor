import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/svgIcons/Logo";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <h2 className="text-xl font-bold text-[#061400] md:text-2xl">{title}</h2>
    <div className="space-y-4 text-sm leading-7 text-[#5F665D] md:text-base">
      {children}
    </div>
  </section>
);

const Subsection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-[#061400]">{title}</h3>
    {children}
  </div>
);

const TermsList = ({ children }: { children: React.ReactNode }) => (
  <ul className="ml-5 list-disc space-y-2">{children}</ul>
);

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FCFCFC]">
      <header className="sticky top-0 z-10 border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <Logo />
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4FCA6A] hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to signup
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
        <div className="border-b border-[#E8E8E8] pb-10">
          <p className="mb-3 text-sm font-bold uppercase text-[#4FCA6A]">
            Swiftree Technologies
          </p>
          <h1 className="text-3xl font-bold text-[#061400] md:text-5xl">
            Customer Terms of Use
          </h1>
          <p className="mt-4 text-sm text-[#737A70] md:text-base">
            For buyers purchasing goods from a Swiftree-powered storefront
          </p>
        </div>

        <div className="space-y-12 pt-10">
          <section className="space-y-4 text-sm leading-7 text-[#5F665D] md:text-base">
            <p>
              Welcome to Swiftree! These Terms of Use govern your experience
              when purchasing products or services from a digital storefront
              powered by Swiftree Technologies (&quot;Swiftree&quot;,
              &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
            </p>
            <p>
              Swiftree provides the technology, payment processing, and
              logistics infrastructure that empowers independent businesses
              (&quot;Vendors&quot;) to sell their products. By placing an order
              through a Swiftree-powered storefront, you agree to these Terms.
            </p>
          </section>

          <Section title="1. Our Role">
            <p>
              Swiftree acts strictly as a technology and commerce
              infrastructure provider. We provide the platform that allows the
              Vendor to manage their storefront, process your payment, and
              coordinate delivery. We are not the seller of the goods. Any
              contract of sale is directly between you and the Vendor.
            </p>
          </Section>

          <Section title="2. Purchasing and Payments">
            <TermsList>
              <li>
                <strong className="text-[#061400]">Order Accuracy:</strong> You
                are responsible for ensuring that all details provided during
                checkout, including contact information and delivery address,
                are accurate.
              </li>
              <li>
                <strong className="text-[#061400]">Standard Payments:</strong>{" "}
                All standard payments are processed securely through our
                official payment gateway, Paystack.
              </li>
              <li>
                <strong className="text-[#061400]">
                  Buy Now, Pay Later (Klump):
                </strong>{" "}
                If you choose to pay using the Klump Buy Now, Pay Later option,
                you acknowledge that you are entering into a separate, direct
                credit agreement with Klump. Swiftree is not a lender, financial
                institution, or credit provider.
                <ul className="ml-5 mt-3 list-[circle] space-y-2">
                  <li>
                    Approval for BNPL financing is entirely at Klump&apos;s
                    discretion.
                  </li>
                  <li>
                    Repayment schedules, late fees, and credit reporting are
                    governed exclusively by Klump&apos;s terms and conditions.
                  </li>
                  <li>
                    If you cancel an order or request a refund for a purchase
                    made via Klump, the refund will be processed back to your
                    Klump account in accordance with the Vendor&apos;s refund
                    policy and Klump&apos;s processing timelines.
                  </li>
                </ul>
              </li>
              <li>
                <strong className="text-[#061400]">
                  No Cash on Delivery:
                </strong>{" "}
                Cash on Delivery is strictly prohibited on the Swiftree
                platform. All orders must be prepaid through the secure online
                checkout before dispatch.
              </li>
            </TermsList>
          </Section>

          <Section title="3. Deliveries and Logistics">
            <p>
              Deliveries are fulfilled by third-party logistics partners,
              including GIG Logistics, Sendbox, and Chowdeck Logistics Limited.
            </p>

            <Subsection title="3.1 Delivery Timelines">
              <p>
                Delivery timelines displayed at checkout are estimates based on
                your geographic zone and the assigned courier. Timelines are not
                guaranteed and may be affected by weather, operational
                constraints, or public holidays.
              </p>
            </Subsection>

            <Subsection title="3.2 Receiving Your Order">
              <TermsList>
                <li>
                  <strong className="text-[#061400]">Availability:</strong> You
                  commit to being available to receive your order at the
                  designated delivery address.
                </li>
                <li>
                  <strong className="text-[#061400]">
                    Failed Deliveries:
                  </strong>{" "}
                  If a delivery partner arrives and is unable to deliver the
                  order because you are unreachable, unavailable, or provided an
                  incorrect address, the order will be marked as a failed
                  delivery. You are not entitled to request a refund or a free
                  redelivery for orders you failed to receive due to your own
                  unavailability or error.
                </li>
              </TermsList>
            </Subsection>

            <Subsection title="3.3 Order Issues and Claims">
              <TermsList>
                <li>
                  <strong className="text-[#061400]">
                    Chowdeck Deliveries:
                  </strong>{" "}
                  If your local order arrives incomplete, mixed-up, or
                  inaccurate, you must contact Swiftree customer service or the
                  Vendor immediately upon delivery. The order must remain
                  exactly as delivered and untampered with.
                </li>
                <li>
                  <strong className="text-[#061400]">
                    Standard Shipping (GIG & Sendbox):
                  </strong>{" "}
                  Any claims for loss, damage, or missing items must be
                  submitted with clear photographic evidence within 48 hours of
                  receipt. Failure to report within this window voids liability.
                </li>
              </TermsList>
            </Subsection>
          </Section>

          <Section title="4. Prohibited Activities">
            <p>
              You agree not to use Swiftree-powered storefronts for any
              fraudulent purpose, including using stolen credit cards, providing
              false identification, or attempting to bypass the payment
              gateways.
            </p>
          </Section>

          <Section title="5. Data & Privacy">
            <p>
              We collect and process your personal data, such as name, address,
              and payment details, solely to facilitate your transaction,
              arrange delivery, and process BNPL applications via our partners.
              Your data is handled strictly in accordance with our Privacy
              Policy.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>Because Swiftree is not the seller of the items:</p>
            <TermsList>
              <li>
                We do not guarantee the existence, quality, safety, or legality
                of the items sold by Vendors.
              </li>
              <li>
                We make no warranties, express or implied, regarding the
                satisfactory quality or fitness for purpose of any purchased
                items.
              </li>
              <li>
                We are not liable for any losses, delays, damages, or financial
                penalties caused directly or indirectly by the Vendor, Klump, or
                our third-party logistics providers.
              </li>
            </TermsList>
          </Section>

          <Section title="7. Governing Law">
            <p>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria.
            </p>
          </Section>

          <div className="border-t border-[#E8E8E8] pt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[#4FCA6A] px-4 py-2.5 text-sm font-semibold text-[#061400] transition-colors hover:bg-[#45B862]"
            >
              <ArrowLeft className="size-4" />
              Back to signup
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
