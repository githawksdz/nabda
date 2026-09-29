/**
 * Static checks for promotional card components and integrity rules.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel: string) {
  return fs.existsSync(path.join(ROOT, rel));
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const coupon = read("components/promotions/ProCouponCard.tsx");
const profile = read("components/promotions/ProfileCompletionCard.tsx");
const pain = read("components/promotions/ProPainPointCard.tsx");
const countdown = read("lib/promotions/countdown.ts");
const hook = read("lib/promotions/use-offer-countdown.ts");
const guards = read("lib/promotions/pro-coupon-guards.ts");
const types = read("lib/promotions/types.ts");
const profileData = read("lib/promotions/profile-completion-data.ts");
const painVariants = read("lib/promotions/pain-point-variants.ts");
const aura = read("components/promotions/ProPromoAura.tsx");
const css = read("app/promo-cards.css");
const ux = read("docs/design/ux.md");

check(
  "three_separate_components",
  exists("components/promotions/ProCouponCard.tsx") &&
    exists("components/promotions/ProfileCompletionCard.tsx") &&
    exists("components/promotions/ProPainPointCard.tsx"),
  "components/promotions",
);

check(
  "no_universal_promo_component",
  !exists("components/promotions/PromotionalCard.tsx") &&
    !coupon.includes('type="coupon"') &&
    !profile.includes("PromotionalCard"),
  "no mega component",
);

check(
  "no_event_card",
  !exists("components/promotions/AnnouncementCard.tsx") &&
    !exists("components/promotions/EventCard.tsx") &&
    !types.includes("AnnouncementCard"),
  "event postponed",
);

check(
  "coupon_requires_eligible",
  types.includes("eligible: boolean") && guards.includes("campaign.eligible"),
  "ProCouponCampaign.eligible",
);

check(
  "coupon_requires_ends_at",
  types.includes("endsAt: string") && countdown.includes("Date.parse(endsAt)"),
  "absolute endsAt",
);

check(
  "countdown_no_mount_reset",
  !hook.includes("12 * 60 * 60") &&
    !countdown.includes("Date.now() +") &&
    hook.includes("endsAt"),
  "use-offer-countdown",
);

check(
  "expired_coupon_hidden",
  guards.includes("isOfferExpired") && coupon.includes("canRenderProCouponCard"),
  "guards + card",
);

check(
  "no_dead_cta",
  coupon.includes("onboardingHref") &&
    guards.includes("onboardingHref") &&
    pain.includes("!variant.onboardingHref"),
  "CTA guards",
);

check(
  "pro_user_exclusion",
  read("lib/promotions/resolve-home-promotion.ts").includes("isProPlanSlug") &&
    pain.includes("show = true"),
  "resolve-home-promotion",
);

check(
  "profile_uses_completion_data",
  profile.includes("completionPercent") && profileData.includes("computeProfileCompletion"),
  "profile data",
);

check(
  "verification_not_from_percent",
  profileData.includes("never inferred") ||
    profileData.includes("never infer") ||
    profileData.includes("not inferred"),
  "profile-completion-data comment",
);

check(
  "dosage_requires_explicit",
  profileData.includes('"personalization"') &&
    !profileData.includes('return "drug_dosage"'),
  "no inferred dosage unlock",
);

check(
  "pain_point_no_random",
  !pain.includes("Math.random") && !painVariants.includes("Math.random"),
  "pain-point-variants",
);

check(
  "aura_reduced_motion",
  css.includes(".promo-pro-aura") &&
    css.includes("prefers-reduced-motion: reduce") &&
    aura.includes("promo-pro-aura"),
  "globals.css",
);

check(
  "no_countdown_pulse",
  !coupon.includes("animate-") && !hook.includes("aria-live"),
  "ProCouponCard",
);

check(
  "coupon_plan_layout",
  coupon.includes("ProPlanCardShell") &&
    css.includes("promo-pro-plan-card") &&
    !coupon.includes("promo-coupon-ticket__notch"),
  "plan card layout",
);

check(
  "home_promo_not_above_resume",
  (() => {
    const dashboard = read("components/home/HomeDashboard.tsx");
    const resume = dashboard.indexOf("<HomeResumeSection");
    const promo = dashboard.indexOf("<HomePromotionalSlotView");
    return resume >= 0 && promo > resume;
  })(),
  "HomeDashboard.tsx",
);

check(
  "pro_cards_dark_surface",
  css.includes("promo-pro-plan-card") &&
    coupon.includes("ProPlanCardShell") &&
    pain.includes("ProPlanCardShell"),
  "dark Pro plan surface",
);

check(
  "rainbow_on_cta_not_card",
  css.includes("promo-cta__frame") &&
    css.includes("conic-gradient") &&
    coupon.includes("ProCtaButton") &&
    pain.includes("ProCtaButton") &&
    !coupon.includes("promo-pro-shell") &&
    !pain.includes("promo-pro-shell"),
  "CTA rainbow",
);

check(
  "rainbow_reduced_motion",
  css.includes("promo-rainbow-border") &&
    css.includes("prefers-reduced-motion: reduce") &&
    /prefers-reduced-motion: reduce[\s\S]*\.promo-cta__frame[\s\S]*animation: none/.test(
      css,
    ),
  "promo-cards.css",
);

check(
  "pro_conversion_not_dismissible",
  !pain.includes("onDismiss") &&
    !pain.includes("Masquer cette offre") &&
    !coupon.includes("onDismiss") &&
    read("components/promotions/HomePromotionalSlotView.tsx").includes(
      "<ProPainPointCard variant={slot.variant} />",
    ),
  "no Pro dismiss",
);

check(
  "benefits_are_ticked_bullets",
  pain.includes("ProPlanBenefitList") &&
    read("components/promotions/ProPlanBenefitList.tsx").includes("Check") &&
    !pain.includes("promo-pain-chip") &&
    !painVariants.includes("Packs téléchargeables") &&
    !painVariants.includes("selon votre compte"),
  "pain-point benefits",
);

check(
  "module_list_promotion_wired",
  read("app/(doctor)/protocols/page.tsx").includes("loadModuleListPromotion") &&
    read("app/(doctor)/drugs/page.tsx").includes("loadModuleListPromotion") &&
    read("app/(doctor)/calculators/page.tsx").includes("loadModuleListPromotion") &&
    read("components/protocols/ProtocolsIndexPage.tsx").includes(
      "interleaveModulePromotion",
    ) &&
    read("lib/promotions/resolve-module-promotion.ts").includes("isProPlanSlug"),
  "module lists",
);

check(
  "coupon_loader_no_direct_demo_import",
  !read("lib/promotions/load-pro-coupon-campaign.ts").includes(
    "demo-fixtures/promotions",
  ) &&
    read("lib/promotions/load-pro-coupon-campaign.ts").includes(
      "getPromotionalCardsDemoFixtures",
    ),
  "load-pro-coupon-campaign.ts",
);

check(
  "no_cta_pulse",
  !pain.includes("animate-pulse") && !coupon.includes("animate-pulse"),
  "cards",
);

check(
  "design_rules_section",
  ux.includes("## Banners & Promotional Cards"),
  "docs/design/ux.md",
);

check(
  "design_rules_frequency",
  ux.includes("Maximum two promotional impressions") &&
    ux.includes("not dismissible"),
  "frequency",
);

check(
  "event_postponed_documented",
  ux.includes("Informational and event announcement cards are postponed"),
  "deferred event cards",
);

check(
  "dev_preview_not_in_production",
  read("app/dev/promotional-cards/page.tsx").includes(
    'process.env.NODE_ENV === "production"',
  ) && read("app/dev/promotional-cards/page.tsx").includes("notFound()"),
  "app/dev/promotional-cards/page.tsx",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `promotional cards ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
