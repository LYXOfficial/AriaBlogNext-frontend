// jshint multistr:true

const TABLE_NAME = "hljs-ln",
  LINE_NAME = "hljs-ln-line",
  CODE_BLOCK_NAME = "hljs-ln-code",
  NUMBERS_BLOCK_NAME = "hljs-ln-numbers",
  NUMBER_LINE_NAME = "hljs-ln-n",
  DATA_ATTR_NAME = "data-line-number",
  BREAK_LINE_REGEXP = /\r\n|\r|\n/g;

addStyles();

function addStyles(): void {
  const css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = format(
    ".{0}{border-collapse:collapse}" +
      ".{0} td{padding:0}" +
      ".{1}:before{content:attr({2})}",
    [TABLE_NAME, NUMBER_LINE_NAME, DATA_ATTR_NAME],
  );
  document.getElementsByTagName("head")[0].appendChild(css);
}

function initLineNumbersOnLoad(options?: any): void {
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    documentReady(options);
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      documentReady(options);
    });
  }
}

function documentReady(options?: any): void {
  try {
    const blocks = document.querySelectorAll<HTMLElement>(
      "code.hljs,code.nohighlight",
    );

    blocks.forEach((block) => {
      if (!isPluginDisabledForBlock(block)) {
        lineNumbersBlock(block, options);
      }
    });
  } catch (e) {
    window.console.error("LineNumbers error: ", e);
  }
}

function isPluginDisabledForBlock(element: HTMLElement): boolean {
  return element.classList.contains("nohljsln");
}

function lineNumbersBlock(element: HTMLElement, options?: any): void {
  if (typeof element !== "object") return;
  element.innerHTML = lineNumbersInternal(element, options);
}

function lineNumbersInternal(element: HTMLElement, options?: any): string {
  const internalOptions = mapOptions(element, options);
  duplicateMultilineNodes(element);
  return addLineNumbersBlockFor(element.innerHTML, internalOptions);
}

function addLineNumbersBlockFor(inputHtml: string, options: any): string {
  const lines = getLines(inputHtml);

  // if last line contains only carriage return remove it
  if (lines[lines.length - 1]?.trim() === "") {
    lines.pop();
  }

  if (lines.length > 1 || options.singleLine) {
    let html = "";

    for (let i = 0, l = lines.length; i < l; i++) {
      html += format(
        "<tr>" +
          '<td class="{0} {1}" {3}="{5}">' +
          '<div class="{2}" {3}="{5}"></div>' +
          "</td>" +
          '<td class="{0} {4}" {3}="{5}">' +
          "{6}" +
          "</td>" +
          "</tr>",
        [
          LINE_NAME,
          NUMBERS_BLOCK_NAME,
          NUMBER_LINE_NAME,
          DATA_ATTR_NAME,
          CODE_BLOCK_NAME,
          i + options.startFrom,
          lines[i].length > 0 ? lines[i] : " ",
        ],
      );
    }

    return format('<table class="{0}">{1}</table>', [TABLE_NAME, html]);
  }

  return inputHtml;
}

function mapOptions(element: HTMLElement, options: any): any {
  options = options || {};
  return {
    singleLine: getSingleLineOption(options),
    startFrom: getStartFromOption(element, options),
  };
}

function getSingleLineOption(options: any): boolean {
  const defaultValue = false;
  if (options.singleLine) {
    return options.singleLine;
  }
  return defaultValue;
}

function getStartFromOption(element: HTMLElement, options: any): number {
  const defaultValue = 1;
  let startFrom = defaultValue;

  if (isFinite(options.startFrom)) {
    startFrom = options.startFrom;
  }

  // can be overridden because local option is priority
  const value = getAttribute(element, "data-ln-start-from");
  if (value !== null) {
    startFrom = toNumber(value, defaultValue);
  }

  return startFrom;
}

function duplicateMultilineNodes(element: HTMLElement): void {
  const nodes = element.childNodes;
  nodes.forEach((child) => {
    if (getLinesCount((child as HTMLElement).textContent || "") > 0) {
      if (child.childNodes.length > 0) {
        duplicateMultilineNodes(child as HTMLElement);
      } else {
        duplicateMultilineNode(
          (child as HTMLElement).parentNode as HTMLElement,
        );
      }
    }
  });
}

function duplicateMultilineNode(element: HTMLElement): void {
  const className = element.className;

  if (!/hljs-/.test(className)) return;

  const lines = getLines(element.innerHTML);

  let result = "";
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].length > 0 ? lines[i] : " ";
    result += format('<span class="{0}">{1}</span>\n', [className, lineText]);
  }

  element.innerHTML = result.trim();
}

function getLines(text: string): string[] {
  if (text.length === 0) return [];
  return text.split(BREAK_LINE_REGEXP);
}

function getLinesCount(text: string): number {
  return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
}

function format(format: string, args: any[]): string {
  return format.replace(/\{(\d+)\}/g, (m, n) => {
    return args[n] !== undefined ? args[n] : m;
  });
}

function getAttribute(element: HTMLElement, attrName: string): string | null {
  return element.hasAttribute(attrName) ? element.getAttribute(attrName) : null;
}

function toNumber(str: string | null, fallback: number): number {
  if (!str) return fallback;
  const number = Number(str);
  return isFinite(number) ? number : fallback;
}

export { lineNumbersBlock, initLineNumbersOnLoad };
