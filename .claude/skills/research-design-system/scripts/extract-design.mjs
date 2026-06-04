#!/usr/bin/env node
// Extract design system signals from a live website using headless Chromium.
// Usage: node extract-design.mjs <url> [--viewport=1440x900]
// Output: JSON to stdout. Errors to stderr with non-zero exit.

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const viewportArg = args.find((a) => a.startsWith('--viewport='));
const [vw, vh] = viewportArg ? viewportArg.split('=')[1].split('x').map(Number) : [1440, 900];

if (!url) {
  console.error('Usage: node extract-design.mjs <url> [--viewport=1440x900]');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: vw, height: vh },
  userAgent:
    'Mozilla/5.0 (compatible; AgentDesignSystem/1.0; research-design-system skill)',
});
const page = await context.newPage();

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  // Give fonts and lazy CSS time to settle
  await page.waitForTimeout(800);

  const result = await page.evaluate(() => {
    const data = {
      url: window.location.href,
      title: document.title,
      meta: {},
      customProperties: { root: {}, dataTheme: {} },
      fonts: [],
      typography: {},
      colorsSamples: {},
      buttonsSamples: [],
      inputsSamples: [],
      cardsSamples: [],
      linksSamples: [],
      mediaQueries: [],
    };

    // Meta tags relevant to theming
    document.querySelectorAll('meta').forEach((m) => {
      const name = m.getAttribute('name') || m.getAttribute('property') || '';
      if (
        name.includes('color') ||
        name.includes('description') ||
        name === 'viewport'
      ) {
        data.meta[name] = m.getAttribute('content');
      }
    });

    function extractCustomProps(element) {
      const styles = window.getComputedStyle(element);
      const props = {};
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          props[prop] = styles.getPropertyValue(prop).trim();
        }
      }
      return props;
    }
    data.customProperties.root = extractCustomProps(document.documentElement);
    const themed = document.querySelector('[data-theme]');
    if (themed) {
      data.customProperties.dataTheme = extractCustomProps(themed);
    }

    if (document.fonts) {
      data.fonts = Array.from(document.fonts.values()).map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        status: f.status,
      }));
    }

    ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'small', 'code'].forEach(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const s = window.getComputedStyle(el);
        data.typography[sel] = {
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
          color: s.color,
        };
      }
    );

    function colorOf(sel) {
      const els = document.querySelectorAll(sel);
      const result = [];
      for (let i = 0; i < Math.min(els.length, 3); i++) {
        const el = els[i];
        const s = window.getComputedStyle(el);
        result.push({
          bg: s.backgroundColor,
          color: s.color,
          border: s.borderColor,
        });
      }
      return result;
    }
    data.colorsSamples.body = colorOf('body');
    data.colorsSamples.header = colorOf('header, nav');
    data.colorsSamples.footer = colorOf('footer');
    data.colorsSamples.main = colorOf('main, section');

    const buttonSelectors = [
      'button',
      'a.btn',
      'a.button',
      '[class*="btn"]',
      '[class*="Button"]',
      '[class*="button"]',
      '[role="button"]',
    ];
    const seenButtons = new Set();
    buttonSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (data.buttonsSamples.length >= 10) return;
        const s = window.getComputedStyle(el);
        const key = `${s.backgroundColor}|${s.color}|${s.borderRadius}|${s.padding}`;
        if (seenButtons.has(key)) return;
        seenButtons.add(key);
        data.buttonsSamples.push({
          tag: el.tagName.toLowerCase(),
          className:
            typeof el.className === 'string'
              ? el.className.slice(0, 100)
              : '',
          textSample: el.textContent?.trim().slice(0, 40) || '',
          bg: s.backgroundColor,
          color: s.color,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
          borderRadius: s.borderRadius,
          padding: s.padding,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          boxShadow: s.boxShadow,
          transition: s.transition,
        });
      });
    });

    ['input[type="text"]', 'input[type="email"]', 'input:not([type])', 'textarea'].forEach(
      (sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (data.inputsSamples.length >= 3) return;
          const s = window.getComputedStyle(el);
          data.inputsSamples.push({
            tag: el.tagName.toLowerCase(),
            bg: s.backgroundColor,
            color: s.color,
            border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
            borderRadius: s.borderRadius,
            padding: s.padding,
            fontSize: s.fontSize,
          });
        });
      }
    );

    ['[class*="card"]', '[class*="Card"]', 'article'].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (data.cardsSamples.length >= 5) return;
        const s = window.getComputedStyle(el);
        const key = `${s.backgroundColor}|${s.borderRadius}|${s.boxShadow}`;
        if (data.cardsSamples.some((c) => c._key === key)) return;
        data.cardsSamples.push({
          _key: key,
          tag: el.tagName.toLowerCase(),
          bg: s.backgroundColor,
          borderRadius: s.borderRadius,
          padding: s.padding,
          boxShadow: s.boxShadow,
          border: `${s.borderWidth} ${s.borderStyle} ${s.borderColor}`,
        });
      });
    });
    data.cardsSamples.forEach((c) => delete c._key);

    document.querySelectorAll('a').forEach((el) => {
      if (data.linksSamples.length >= 3) return;
      const s = window.getComputedStyle(el);
      if (s.color === 'rgb(0, 0, 0)' || s.color === 'rgba(0, 0, 0, 0)') return;
      data.linksSamples.push({
        color: s.color,
        textDecoration: s.textDecorationLine,
        fontWeight: s.fontWeight,
      });
    });

    try {
      const collected = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.MEDIA_RULE) {
              const mq = rule.conditionText || rule.media?.mediaText;
              if (mq && (mq.includes('min-width') || mq.includes('max-width'))) {
                collected.add(mq);
              }
            }
          }
        } catch (e) {
          // cross-origin stylesheet — skip
        }
      }
      data.mediaQueries = [...collected];
    } catch (e) {}

    return data;
  });

  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error(
    JSON.stringify(
      { error: err.message, stack: (err.stack || '').slice(0, 500) },
      null,
      2
    )
  );
  process.exit(2);
} finally {
  await browser.close();
}
