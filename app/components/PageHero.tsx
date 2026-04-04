import React from "react";
import { DocumentHeroArt, type HeroArtMode } from "./DocumentHeroArt";

type HeroStat = {
  label: string;
  value: string;
};

export function PageHero({
  kicker,
  title,
  copy,
  chips = [],
  stats = [],
  artMode = "home",
  actions,
}: {
  kicker: string;
  title: string;
  copy: string;
  chips?: string[];
  stats?: HeroStat[];
  artMode?: HeroArtMode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-hero page-hero-rich p-6 md:p-7">
      <div className="hero-layout">
        <div className="hero-copy">
          <div className="page-kicker mb-4">{kicker}</div>
          <h1 className="page-title max-w-[760px]">{title}</h1>
          <p className="page-copy mt-4">{copy}</p>

          {actions ? <div className="hero-actions mt-6">{actions}</div> : null}

          {chips.length ? (
            <div className="hero-chip-row mt-6">
              {chips.map((chip) => (
                <span key={chip} className="premium-chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {stats.length ? (
            <div className="hero-metrics mt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="hero-metric">
                  <div className="hero-metric-label">{stat.label}</div>
                  <div className="hero-metric-value">{stat.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hero-art-shell">
          <div className="hero-art-panel">
            <DocumentHeroArt mode={artMode} className="hero-art-svg" />
          </div>
        </div>
      </div>
    </section>
  );
}
