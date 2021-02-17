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

export function prop(key: string | symbol, value: string | symbol): Property {
  return { type: 'property', key, value };
}

export function rule(selectors: Iterable<string>): (iterable: Iterable<Property>) => Rule {
  return (iterable) => ({ type: 'rule', selectors: Array.from(selectors), properties: iterable });
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
