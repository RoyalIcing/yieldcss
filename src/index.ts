export type PresentableValue = string | number | Promise<PresentableValue>;

interface Property {
  type: 'property';
  key: string | symbol;
  value: string | symbol;
}

interface Rule {
  type: 'rule';
  selectors: Array<string>;
  properties: Iterable<Property>;
}

function* empty() {}

function propFunc(key: string | symbol, value: string | symbol): Property {
  return { type: 'property', key, value };
}

type PropFunc = typeof propFunc;
type CSSStylePropName = Exclude<keyof CSSStyleDeclaration, number | "setProperty" | "removeProperty" | "item" | "getPropertyValue" | "getPropertyPriority" | "length">;
type CSSStylePropBuilder = Record<CSSStylePropName, (value: string) => Property>;

type Prop = PropFunc & CSSStylePropBuilder;

export const prop = new Proxy(propFunc, {
  get(_target, key: keyof CSSStyleDeclaration) {
    const kebabCase = key.toString().replace(/[A-Z]/g, '-$&').toLowerCase();
    return (value) => propFunc(kebabCase, value);
  }
}) as Prop;

export function rule(selectors: Iterable<string>): (iterable: Iterable<Property>) => Rule {
  return (iterable) => ({ type: 'rule', selectors: Array.from(selectors), properties: iterable });
}

export function data(key: string, value?: string): string {
  if (value === undefined) {
    return `[${key}]`;
  } else {
    return `[${key}=${JSON.stringify(value)}]`;
  }
}

/**
 *
 * @param {Iterable<PresentableValue>} iterable
 */
export function* renderGenerator(iterable) {
  const iterator = iterable[Symbol.iterator]();
  let done = false;
  let next: any = undefined;
  while (!done) {
    const current = iterator.next(next);
    next = undefined;
    const child = current.value;
    done = current.done;

    if (child == null || child === false) continue;

    if (typeof child === "string" || typeof child === "number") {
      yield child.toString();
    } else if (typeof child.then === "function") {
      yield child.then((result) =>
        Promise.all(renderGenerator([result]))
      );
    } else if (child[Symbol.iterator]) {
      yield* renderGenerator(child);
    } else if (child.type === 'rule') {
      yield child.selectors.join(', ');
      yield ' {\n';
      for (const property of child.properties) {
        if (typeof property.key === 'symbol') {
          yield `--${property.key.description}`;
        } else {
          yield property.key;
        }
        yield ': ';
        if (typeof property.value === 'symbol') {
          yield `var(--${property.value.description})`;
        } else {
          yield property.value;
        }
        yield ';';
      }
      yield '\n}';
    }
  }
}

/**
 *
 * @param {Generator} children
 * @return {Promise<string>}
 */
export async function renderToString(children) {
  const resolved = await Promise.all(renderGenerator(children));
  return resolved.filter(Boolean).join("");
}

export function* css(literals, ...values) {
  for (let i = 0; i < literals.length; i++) {
    yield new String(literals[i]); // Mark as html-safe by converting to string object
    if (values[i] != null && values[i] !== false) {
      yield values[i];
    }
  }
}
