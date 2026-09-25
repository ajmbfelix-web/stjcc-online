import { createFileRoute } from "@tanstack/react-router";
import { H2, LearnArticle } from "@/components/learn-article";
import { canonical, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/learn/reasons")({
  head: () => ({
    meta: [
      { title: pageTitle("Why a test gets ordered") },
      { name: "description", content: "Pre-employment, random, post-accident, reasonable suspicion, and follow-up testing, in plain language." },
    ],
    links: [{ rel: "canonical", href: canonical("/learn/reasons") }],
  }),
  component: Page,
});

function Page() {
  return (
    <LearnArticle
      eyebrow="Test reasons"
      title="Random is only one reason a driver is sent."
      lede="Part 382 names several times a test is required. SJCC can order the test the employer is authorized to buy. SJCC does not decide that an accident met the rule, and SJCC is not a substance abuse professional."
    >
      <section>
        <H2>Pre-employment</H2>
        <p className="mt-3">Before a driver performs safety-sensitive work for a new employer, a DOT drug test is part of hiring. A hire-screen account at SJCC can order that drug test, and background screens, without joining the monthly fleet program. A fleet account orders it for a driver being added to the roster.</p>
      </section>
      <section>
        <H2>Random</H2>
        <p className="mt-3">Unannounced selections from the SJCC consortium, spread through the year. The driver does not choose the day. Your company sees only its own names.</p>
      </section>
      <section>
        <H2>Post-accident</H2>
        <p className="mt-3">After some crashes, FMCSA requires a test, and the window is short. The employer, not the driver and not SJCC, determines whether this crash is one of those. If it is, the test is ordered immediately. Waiting until the truck is back at the yard the next week misses the rule. Alcohol testing and drug testing have different time limits. Ask the company safety contact before you assume a crash “does not count.”</p>
      </section>
      <section>
        <H2>Reasonable suspicion</H2>
        <p className="mt-3">This is a trained supervisor’s specific observations of behavior, appearance, speech, or body odors. It is not a rumor and it is not a dispatch argument. The person who makes that call has to have had the required supervisor training. SJCC places the test when the employer orders it. We do not supply the suspicion.</p>
      </section>
      <section>
        <H2>Return to duty and follow-up</H2>
        <p className="mt-3">After a violation, a driver cannot simply retest and go back to work. A substance abuse professional evaluates the driver, a return-to-duty test is required, and follow-up tests continue on a schedule that professional sets. SJCC is not that professional. If an employer asks us to order one of those tests, we order the test. We do not design the treatment plan, and we do not tell a driver how to get the next job.</p>
      </section>
      <section>
        <H2>Marijuana</H2>
        <p className="mt-3">A state law that allows marijuana does not remove it from a DOT drug test. A CDL driver is still tested for it. A medical card from a state program is not a DOT excuse. The medical review officer applies the federal rules, not the dispensary’s.</p>
      </section>
    </LearnArticle>
  );
}
