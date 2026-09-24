import { ArrowRight, MapPin, MessageCircle, Search, Store } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: t("about.discoverTitle"),
      text: t("about.discoverText"),
    },
    {
      icon: Store,
      title: t("about.sellerTitle"),
      text: t("about.sellerText"),
    },
    {
      icon: MapPin,
      title: t("about.locationTitle"),
      text: t("about.locationText"),
    },
    {
      icon: MessageCircle,
      title: t("about.connectTitle"),
      text: t("about.connectText"),
    },
  ];

  return (
    <div className="page about-page">
      <Header title={t("about.title")} />

      <section className="about-intro">
        <span className="welcome-kicker">{t("about.kicker")}</span>

        <h1>{t("about.headline")}</h1>

        <p>{t("about.intro")}</p>
      </section>

      <section className="about-steps">
        <h2>{t("about.howItWorks")}</h2>

        {steps.map(({ icon: Icon, title, text }, index) => (
          <div className="about-step" key={title}>
            <span className="about-step-number">0{index + 1}</span>

            <Icon size={21} />

            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="about-audience">
        <div>
          <h2>{t("about.customersTitle")}</h2>
          <p>{t("about.customersText")}</p>
        </div>

        <div>
          <h2>{t("about.sellersTitle")}</h2>
          <p>{t("about.sellersText")}</p>
        </div>
      </section>

      <Link to="/explore" className="about-cta">
        {t("about.explore")}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
