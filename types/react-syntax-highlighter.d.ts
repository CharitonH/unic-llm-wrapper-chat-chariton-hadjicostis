declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    children?: React.ReactNode;
  }

  export class Light extends React.Component<SyntaxHighlighterProps> {}
  export class Prism extends React.Component<SyntaxHighlighterProps> {}
}

declare module "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark" {
  const content: { [key: string]: import("react").CSSProperties };
  export default content;
}
