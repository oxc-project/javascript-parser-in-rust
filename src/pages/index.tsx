import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          JavaScript, Rust and parsers are all hard to learn,
          let's combine these three and challenge ourselves to write a JavaScript parser in Rust.
        </p>
        <p className="hero__subtitle">
          This will be the book for you if you are interested in learning Rust, parsers,
          or would like to contribute to <a href="https://swc.rs" target="__blank">swc</a> or <a href="https://rome.tools" target="__blank">Rome</a> in the near future.
        </p>
        <p className="hero__subtitle">
          The book will cover all the basic topics of writing a JavaScript parser in rust.
          And the tutorials will explain some topics in more depth.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            style={{marginRight: "20px"}}
            to="/docs/intro">
            Read the Book
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/blog">
            Read the Tutorials
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="">
      <HomepageHeader />
    </Layout>
  );
}
