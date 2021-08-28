// rules/spoiler.ts
import { Eat, Parser } from 'remark-parse';

function tokenizeSpoiler(eat: Eat, value: string, silent?: boolean): any {
  const match = /\|\|(.*)\|\|/.exec(value);

  if (match) {
    if (silent) {
      return true;
    }
    try {
      return eat(match[0])({
        type: 'spoiler',
        value: match[1],
      });
    } catch {
      // console.log(match[0]);
    }
  }
}
tokenizeSpoiler.notInLink = true;
tokenizeSpoiler.locator = function (value, fromIndex) {
  return value.indexOf('||', fromIndex);
};

function spoilerSyntax(this: any) {
  const Parser = this.Parser as { prototype: Parser };
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  // Add an inline tokenizer (defined in the following example).
  tokenizers.spoiler = tokenizeSpoiler;

  // Run it just before `text`.
  methods.splice(methods.indexOf('text'), 0, 'spoiler');
}
export { spoilerSyntax };
