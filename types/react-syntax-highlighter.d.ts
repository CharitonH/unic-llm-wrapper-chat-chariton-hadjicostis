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

declare module "react-syntax-highlighter/dist/esm/light";

// Declare modules for programming languages
declare module 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
declare module 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
declare module "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/php";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/python";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/java";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/bash";
declare module "react-syntax-highlighter/dist/esm/languages/hljs/css";
