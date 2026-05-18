import { m } from "@/paraglide/messages.js";
import type { Locale } from "@/paraglide/runtime";
import RotatingText from "../ui/rotating-text";

export default function HomeHeroLead({ locale }: { locale: Locale }) {
  const opts = { locale };

  return (
    <RotatingText
      className="inline-block align-baseline"
      mainClassName="inline-flex"
      splitLevelClassName="inline-flex"
      elementLevelClassName="font-semibold text-on-background"
      texts={[
        m.home_feature_dashboard_title(undefined, opts),
        m.home_feature_profiles_title(undefined, opts),
        m.home_feature_rules_title(undefined, opts),
      ]}
      staggerDuration={0.015}
    />
  );
}
