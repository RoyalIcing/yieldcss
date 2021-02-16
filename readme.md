<div align="center">
  <h1>👑 🎨 Yield CSS</h1>
  <p>Generate CSS on-the-fly</p>
  <a href="https://bundlephobia.com/result?p=yieldcss">
    <img src="https://badgen.net/bundlephobia/minzip/yieldcss@0.1.0" alt="minified and gzipped size">
    <img src="https://badgen.net/bundlephobia/min/yieldcss@0.1.0" alt="minified size">
    <img src="https://badgen.net/bundlephobia/dependency-count/yieldcss@0.1.0" alt="zero dependencies">
  </a>
</div>

## Install

```console
npm add yieldcss
```

## Why?

Yield CSS lets you generate CSS on-the-fly, making it perfect for a serverless environment like Cloudflare Workers.

Instead of using tooling to compile written files to other files and then uploading those somewhere, you write functions that output the CSS you want on-the-fly.

This mean you can have conditional CSS, substitute variables, run calculations, and write loops to automate repetitive CSS. You have the full power of JavaScript at hand.

## Examples

```javascript
import { prop, renderToString, vars } from "yieldcss";

// Inspired by https://github.com/sindresorhus/modern-normalize
function* Reset() {
  yield rule(['*', '*::before', '*::after'])([
    prop('box-sizing', 'border-box'),
    prop('margin', '0'),
    prop('font', 'inherit'),
  ]);
  
  yield rule(['html'])([
    // Correct the line height in all browsers.
    prop('line-height', '1.15'),
    // Prevent adjustments of font size after orientation changes in iOS.
    prop('-webkit-text-size-adjust', '100%'),
  ]);
}

function* Main() {
  yield Reset();
}

const css = await renderToString(Main());
```
