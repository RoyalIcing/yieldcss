import { css, prop, rule, renderToString } from "./index";

describe("renderToString()", () => {
  test("rule taking array of properties", async () => {
    function* Reset() {
      yield rule(['*', '*::before', '*::after'])([
        prop('box-sizing', 'border-box'),
        prop('font', 'inherit'),
      ]);
    }
    
    await expect(renderToString(Reset())).resolves.toEqual(
`*, *::before, *::after {
box-sizing: border-box;font: inherit;
}`.trim());
  });
  
  test("rule taking generator for properties", async () => {
    function* BorderBox() {
      yield prop('box-sizing', 'border-box');
      yield prop('font', 'inherit');
    }
    function* Reset() {
      yield rule(['*', '*::before', '*::after'])(BorderBox());
    }
    
    await expect(renderToString(Reset())).resolves.toEqual(
`*, *::before, *::after {
box-sizing: border-box;font: inherit;
}`.trim());
  });
  
  test("rule taking generator for selector and properties", async () => {
    function* Anything() {
      yield '*';
      yield '*::before';
      yield '*::after';
    }
    function* BorderBox() {
      yield prop('box-sizing', 'border-box');
      yield prop('font', 'inherit');
    }
    function* Reset() {
      yield rule(Anything())(BorderBox());
    }
    
    await expect(renderToString(Reset())).resolves.toEqual(
`*, *::before, *::after {
box-sizing: border-box;font: inherit;
}`.trim());
  });
  
  test("generator function yielding another generator function", async () => {
    function* Anything() {
      yield '*';
      yield '*::before';
      yield '*::after';
    }
    function* BorderBox() {
      yield prop('box-sizing', 'border-box');
      yield prop('font', 'inherit');
    }
    function* Reset() {
      yield rule(Anything())(BorderBox());
    }
    function* Main() {
      yield Reset();
    }
    
    await expect(renderToString(Main())).resolves.toEqual(
`*, *::before, *::after {
box-sizing: border-box;font: inherit;
}`.trim());
  });
  
  test("rule reading variable", async () => {
    function* Reset() {
      yield rule(['*', '*::before', '*::after'])([
        prop('color', Symbol('color-primary')),
      ]);
    }
    
    await expect(renderToString(Reset())).resolves.toEqual(
`*, *::before, *::after {
color: var(--color-primary);
}`.trim());
  });
  
  test("rule declaring custom property", async () => {
    function* Reset() {
      yield rule([':root'])([
        prop(Symbol('color-primary'), 'red'),
      ]);
    }
    
    await expect(renderToString(Reset())).resolves.toEqual(
`:root {
--color-primary: red;
}`.trim());
  });
  
  test("empty array", async () => {
    await expect(renderToString([])).resolves.toEqual("");
  });

  test("array of empty string", async () => {
    await expect(renderToString([""])).resolves.toEqual("");
  });

  test("generator function yielding nothing", async () => {
    await expect(renderToString((function* () {})())).resolves.toEqual("");
  });

  test("generator function yielding empty string", async () => {
    await expect(
      renderToString(
        (function* () {
          yield "";
        })()
      )
    ).resolves.toEqual("");
  });

  test("generator function yielding simple string", async () => {
    await expect(
      renderToString(
        (function* () {
          yield "abc";
        })()
      )
    ).resolves.toEqual("abc");
  });

  test("array with generator function yielding simple string", async () => {
    await expect(
      renderToString([
        (function* () {
          yield "abc";
        })(),
      ])
    ).resolves.toEqual("abc");
  });

  test("array with strings and generator functions", async () => {
    await expect(
      renderToString([
        "first",
        (function* () {
          yield "|abc|";
        })(),
        "last",
      ])
    ).resolves.toEqual("first|abc|last");
  });

  test("array with strings and generator functions yielding mix of promises", async () => {
    await expect(
      renderToString([
        "first",
        (function* () {
          yield "|abc|";
          yield Promise.resolve("|def|");
        })(),
        "last",
      ])
    ).resolves.toEqual("first|abc||def|last");
  });
});
