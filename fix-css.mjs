import { readFileSync, writeFileSync, readdirSync } from 'fs';

const dir = 'dist/assets';
const files = readdirSync(dir).filter(f => f.endsWith('.css'));

function stripLayerWrappers(css) {
  // Remove all @layer X { ... } wrappers but keep their content
  let result = '';
  let i = 0;
  while (i < css.length) {
    if (css.substring(i, i + 6) === '@layer') {
      let bracePos = css.indexOf('{', i);
      if (bracePos === -1) break;
      i = bracePos + 1;
      let depth = 1;
      let contentStart = i;
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        if (depth > 0) i++;
      }
      result += css.substring(contentStart, i);
      i++;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

function removeColorMix(css) {
  let result = '';
  let i = 0;
  while (i < css.length) {
    if (css.substring(i, i + 10) === 'color-mix(') {
      let depth = 0;
      let start = i;
      while (i < css.length) {
        if (css[i] === '(') depth++;
        else if (css[i] === ')') { depth--; if (depth === 0) { i++; break; } }
        i++;
      }
      let inner = css.substring(start, i);
      if (inner.includes('transparent')) {
        if (inner.includes('currentcolor') || inner.includes('currentColor')) {
          result += 'currentColor';
        } else if (inner.includes('var(')) {
          let varMatch = inner.match(/var\([^)]+\)/);
          result += varMatch ? varMatch[0] : 'transparent';
        } else {
          result += 'transparent';
        }
      } else {
        result += 'inherit';
      }
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

function removeUnsupportedAtRules(css) {
  // Remove @supports blocks that reference unsupported features but keep fallback content
  // Remove @property rules (not supported in old WebViews)
  css = css.replace(/@property\s+[^{]+\{[^}]*\}/g, '');
  return css;
}

function simplifyIsAndWhere(css) {
  // Replace simple :is(.class) and :where(.class) with the class directly
  // Only handle simple single-selector cases to avoid breaking things
  css = css.replace(/:where\(([^,)]+)\)/g, '$1');
  return css;
}

for (const file of files) {
  const path = `${dir}/${file}`;
  let css = readFileSync(path, 'utf8');
  console.log(`Processing: ${file} (${css.length} chars)`);

  css = stripLayerWrappers(css);
  css = removeColorMix(css);
  css = removeUnsupportedAtRules(css);
  css = simplifyIsAndWhere(css);

  console.log(`  @layer:${css.includes('@layer')} color-mix:${css.includes('color-mix(')} :where:${(css.match(/:where\(/g)||[]).length}`);

  writeFileSync(path, css);
  console.log(`  Done: ${css.length} chars`);
}
