import { MotionConfig, motion, type Variants } from "motion/react";
import CoresCard, { type CoresLabels } from "./cores-card";
import DashboardCard, { type DashboardLabels } from "./dashboard-card";
import FeatureCard, { EMPHASIZED_DECELERATE } from "./feature-card";
import { MorphLoop } from "./m3-shape";
import LogsCard, { type LogsLabels } from "./logs-card";
import MaterialCard, { type MaterialLabels } from "./material-card";
import type { SchemePair } from "./material-schemes";
import ProfilesCard, { type ProfilesLabels } from "./profiles-card";
import TrafficCard, { type TrafficLabels } from "./traffic-card";
import { Icon, type Icons } from "./ui";

interface Copy {
  title: string;
  description: string;
}

export interface FeatureLabels {
  heading: Copy;
  traffic: Copy & { tags: string[]; demo: TrafficLabels };
  profiles: Copy & { guide: string; demo: ProfilesLabels };
  dashboard: Copy & { demo: DashboardLabels };
  material: MaterialLabels;
  cores: Copy & { demo: CoresLabels };
  logs: Copy & { demo: LogsLabels };
}

const word: Variants = {
  hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EMPHASIZED_DECELERATE },
  },
};

/** Split on spaces where the language has them; CJK headings reveal as one phrase. */
function Words({ text }: { text: string }) {
  const parts = text.includes(" ") ? text.split(" ") : [text];
  return parts.map((part, index) => (
    <motion.span className="m3f-word" key={index} variants={word}>
      {part}
      {index < parts.length - 1 ? " " : ""}
    </motion.span>
  ));
}

export default function FeatureSection({
  labels,
  icons,
  schemes,
  base,
}: {
  labels: FeatureLabels;
  icons: Icons;
  schemes: Record<string, SchemePair>;
  base: string;
}) {
  const { traffic, profiles, dashboard, material, cores, logs } = labels;

  return (
    <MotionConfig reducedMotion="user">
      <section
        tabIndex={-1}
        id="features"
        className="m3f home-container"
        aria-labelledby="features-title"
      >
        <motion.header
          className="m3f-heading"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.6 }}
          transition={{ staggerChildren: 0.07 }}
        >
          <h2 id="features-title">
            <Words text={labels.heading.title} />
            <motion.span
              className="m3f-word"
              variants={{
                hidden: { opacity: 0, scale: 0, rotate: -90 },
                shown: {
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 220, damping: 14, delay: 0.3 },
                },
              }}
            >
              <MorphLoop icon={icons.sparkle} />
            </motion.span>
          </h2>
          <motion.p variants={word}>{labels.heading.description}</motion.p>
        </motion.header>

        <div className="m3f-grid">
          <FeatureCard
            name="traffic"
            tone="primary"
            icon={icons.trafficBadge}
            shape={["cookie9", "burst"]}
            title={traffic.title}
            description={traffic.description}
            wide
            extra={
              <ul className="m3f-points">
                {traffic.tags.map((tag) => (
                  <li key={tag}>
                    <Icon icon={icons.check} />
                    {tag}
                  </li>
                ))}
              </ul>
            }
            stage={{}}
          >
            <TrafficCard labels={traffic.demo} icons={icons} />
          </FeatureCard>

          <FeatureCard
            name="profiles"
            tone="secondary"
            icon={icons.profiles}
            shape={["clover4", "cookie4"]}
            title={profiles.title}
            description={profiles.description}
            extra={
              <a className="m3f-button m3f-button-text" href={`${base}/tutorial/proxy-chain/`}>
                {profiles.guide}
                <Icon icon={icons.outward} />
              </a>
            }
          >
            <ProfilesCard labels={profiles.demo} icons={icons} />
          </FeatureCard>

          <FeatureCard
            name="dashboard"
            tone="tertiary"
            icon={icons.widgets}
            shape={["square", "cookie6"]}
            title={dashboard.title}
            description={dashboard.description}
            delay={0.1}
          >
            <DashboardCard labels={dashboard.demo} icons={icons} />
          </FeatureCard>

          <MaterialCard labels={material} icons={icons} schemes={schemes} />

          <FeatureCard
            name="cores"
            tone="secondary"
            icon={icons.memoryBadge}
            shape={["cookie6", "flower8"]}
            title={cores.title}
            description={cores.description}
          >
            <CoresCard labels={cores.demo} icons={icons} />
          </FeatureCard>

          <FeatureCard
            name="logs"
            tone="tertiary"
            icon={icons.terminal}
            shape={["cookie4", "clover4"]}
            title={logs.title}
            description={logs.description}
            delay={0.1}
          >
            <LogsCard labels={logs.demo} icons={icons} />
          </FeatureCard>
        </div>
      </section>
    </MotionConfig>
  );
}
