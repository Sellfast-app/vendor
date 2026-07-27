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
    <div className="space-y-4">{children}</div>
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
            Vendor Terms of Use
          </h1>
          <p className="mt-4 text-sm text-[#737A70] md:text-base">
            For merchants and businesses selling on the Swiftree platform
          </p>
        </div>

        <div className="space-y-12 pt-10">
          <section className="space-y-4 text-sm leading-7 text-[#5F665D] md:text-base">
            <p>
              Welcome to Swiftree Technologies (&quot;Swiftree&quot;,
              &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These
              Terms of Use govern your access to the Swiftree platform,
              including our AI-powered social commerce tools, storefronts,
              payment integrations, and logistics coordination.
            </p>
            <p>
              By registering, subscribing to, or using Swiftree as a Vendor,
              you agree to be bound by these Terms.
            </p>
          </section>

          <Section title="1. Overview & Eligibility">
            <p>
              Swiftree provides tools to automate customer responses, enable
              payments, and coordinate last-mile delivery. To use Swiftree, you
              must:
            </p>
            <TermsList>
              <li>Be at least 18 years old.</li>
              <li>
                Own or manage a legitimate business and hold authority to sell
                the listed products.
              </li>
              <li>
                Provide accurate, complete information and comply with all
                applicable Nigerian laws.
              </li>
            </TermsList>
            <p>
              Swiftree reserves the right to suspend or terminate accounts
              containing false, misleading, or fraudulent information.
            </p>
          </Section>

          <Section title="2. Subscription & Fees">
            <p>
              Swiftree operates on a subscription model, billed in advance and
              non-refundable. Failure to pay may result in service suspension.
            </p>

            <Subsection title="2.1 Payment Processing and Fees">
              <TermsList>
                <li>Standard payments are processed through Paystack.</li>
                <li>
                  Paystack Processing Fee: 1.5% + ₦100 per transaction. The
                  ₦100 is waived for transactions below ₦2,500.
                </li>
                <li>Swiftree Platform Fee: 1.5% per transaction.</li>
                <li>Disbursement Fee: ₦100 flat fee for bank transfers.</li>
              </TermsList>
            </Subsection>

            <Subsection title="2.2 Buy Now, Pay Later (Klump Integration)">
              <p>
                Swiftree integrates with Klump to allow your customers to
                purchase via installment payments.
              </p>
              <TermsList>
                <li>
                  <strong className="text-[#061400]">Credit Risk:</strong>{" "}
                  Klump assumes the credit risk for the customer. You will
                  receive the full settlement for the purchase, minus applicable
                  Klump/Swiftree transaction fees, upfront, just like a
                  standard card transaction.
                </li>
                <li>
                  <strong className="text-[#061400]">
                    Klump Transaction Fees:
                  </strong>{" "}
                  Payments processed via Klump may be subject to a different
                  transaction fee structure, which will be totalled and
                  displayed to your customers at checkout.
                </li>
                <li>
                  <strong className="text-[#061400]">
                    Refunds & Disputes:
                  </strong>{" "}
                  If a customer requests a refund for a Klump transaction, the
                  refund must be processed through the Swiftree platform to
                  ensure Klump is notified and can adjust the customer&apos;s
                  loan balance. Processing a refund outside the platform for a
                  Klump order violates these Terms. Refunds exclude any
                  transaction fees paid at checkout when the item was newly
                  purchased. Swiftree is not liable for customer defaults on
                  Klump loans.
                </li>
              </TermsList>
            </Subsection>

            <Subsection title="2.3 Settlements">
              <p>
                Funds are settled to your valid Nigerian bank account once
                weekly, minus applicable fees. Swiftree is not liable for delays
                caused by public holidays, banking systems, Klump processing
                delays, or incorrect account details.
              </p>
            </Subsection>
          </Section>

          <Section title="3. Logistics & Delivery">
            <p>
              Swiftree coordinates deliveries through partners including
              Sendbox, GIG Logistics, and Chowdeck. Swiftree does not own
              delivery fleets and bears no liability for losses or delays caused
              by these partners.
            </p>

            <Subsection title="3.1 Timelines & Volumetric Weights">
              <TermsList>
                <li>
                  Timelines provided by GIG and Sendbox are estimates. Delivery
                  zones are subject to change based on the courier&apos;s
                  routing capabilities.
                </li>
                <li>
                  For Sendbox and GIG, shipping fees are calculated based on
                  either the actual weight or the volumetric weight of the
                  package, whichever is higher. You are responsible for entering
                  accurate product dimensions. Under-declared weights may result
                  in penalty deductions from your payout.
                </li>
                <li>
                  Cutoff: A daily pickup cutoff time of 4:00 PM applies. Orders
                  processed after 4:00 PM are scheduled for the next working
                  day.
                </li>
              </TermsList>
            </Subsection>

            <Subsection title="3.2 Returns and Failed Deliveries">
              <p>
                Delivery partners, including GIG and Sendbox, will make
                standard delivery attempts up to three times. If unsuccessful,
                the parcel is returned to you. Returns are billed at the
                standard return tariff rate of the respective logistics partner
                and will be automatically deducted from your designated
                logistics wallet or next settlement.
              </p>
            </Subsection>

            <Subsection title="3.3 Claims for Loss or Damage">
              <p>
                Claims for lost or damaged goods via GIG or Sendbox must be
                submitted within 48 hours of delivery or receipt, including
                waybill details and clear photographs.
              </p>
              <p>
                <strong className="text-[#061400]">Liability Cap:</strong>{" "}
                Liability for lost or damaged items is strictly capped at a
                maximum of ₦50,000 per claim, in accordance with Sendbox&apos;s
                and GIG&apos;s declared value/insurance policies, regardless of
                the item&apos;s declared or sale value. Swiftree will solely act
                as an intermediary to file the claim on your behalf but does not
                guarantee claim payouts and does not cover any shortfall between
                the item&apos;s value and the ₦50,000 cap.
              </p>
              <p>
                <strong className="text-[#061400]">High-Value Items:</strong>{" "}
                As the liability cap applies regardless of item value, you are
                strongly advised to account for this limit when listing and
                pricing items above ₦50,000. Swiftree recommends that Vendors
                independently insure high-value shipments, as any loss in
                excess of the cap is borne solely by the Vendor.
              </p>
            </Subsection>

            <Subsection title="3.4 Vendor Responsibilities">
              <p>
                You are solely responsible for providing complete delivery
                addresses, truthful waybill descriptions, and properly packaging
                items to withstand transit. Any costs arising from incorrect
                details, redelivery, or misdeclaration will be charged to you.
              </p>
            </Subsection>

            <Subsection title="3.5 Cash on Delivery Policy">
              <p>
                Cash on Delivery is NOT supported. All orders must be prepaid.
                Attempting to process COD outside the platform constitutes a
                material breach of these Terms and will result in immediate
                account suspension.
              </p>
            </Subsection>

            <Subsection title="3.6 Chowdeck Partner Deliveries">
              <p>For immediate/local deliveries via Chowdeck:</p>
              <TermsList>
                <li>You must ensure order accuracy before dispatch.</li>
                <li>
                  If the recipient fails to take delivery due to unavailability
                  or incorrect address details, the order is marked as failed.
                </li>
                <li>
                  Missing or tampered items must be reported immediately upon
                  delivery.
                </li>
              </TermsList>
            </Subsection>
          </Section>

          <Section title="4. Prohibited Products">
            <p>
              You may not sell illegal/restricted goods, counterfeit products,
              fraudulent schemes, or hazardous materials prohibited by Sendbox
              or GIG. Violations result in immediate termination and potential
              legal action.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              Swiftree owns all platform IP. You retain ownership of your
              product content but grant Swiftree a license to display it for
              platform operations.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              Swiftree provides infrastructure &quot;as is&quot;. We do not
              guarantee sales volume, customer behavior, Klump approval rates,
              logistics performance, or payment processor uptime. We are not
              liable for indirect, incidental, or consequential losses.
            </p>
          </Section>

          <Section title="7. Termination">
            <p>
              Swiftree may suspend or terminate accounts that violate these
              Terms, engage in fraud, or fail to meet payment obligations. You
              may terminate usage at any time, subject to settling outstanding
              obligations.
            </p>
          </Section>

          <Section title="8. Governing Law">
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
