import React from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

import Translate from "@docusaurus/Translate";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          <Translate id="homepage.subtitle.first">
            Rust, JavaScript, and parsers are all hard to learn, let's combine
            these three and challenge ourselves to write a JavaScript parser in
            Rust.
          </Translate>
        </p>
        <p className="hero__subtitle">
          <Translate id="homepage.subtitle.second_1">
            This will be the guide for you if you are interested in learning Rust, parsers, or would like to contribute to 
          </Translate>
          <span> <a href="https://github.com/boshen/oxc" target="__blank">oxc</a>, <a href="https://swc.rs" target="__blank">swc</a> or <a href="https://biomejs.dev" target="__blank">Biome</a> </span>
          <Translate id="homepage.subtitle.second_2">
            in the near future.
          </Translate>
        </p>
        <p className="hero__subtitle">
          <Translate id="homepage.subtitle.third">
            The guide will cover all the basic topics of writing a JavaScript
            parser in rust. The tutorials will explain some topics in more
            depth.
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            style={{ marginRight: "20px" }}
            to="/docs/intro"
          >
            <Translate id="homepage.read.guide">Read the Guide</Translate>
          </Link>
          <Link className="button button--secondary button--lg" to="/blog">
            <Translate id="homepage.read.tutorials">
              Read the Tutorials
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="">
      <HomepageHeader />
    </Layout>
  );
}
