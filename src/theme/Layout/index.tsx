import React from "react";
import type { Props } from "@theme/Layout";
import Layout from "@theme-original/Layout";
import ExitIntentModal from "@site/src/components/ExitIntentModal";

export default function LayoutWrapper(props: Props) {
  return (
    <Layout {...props}>
      {props.children}
      <ExitIntentModal />
    </Layout>
  );
}
