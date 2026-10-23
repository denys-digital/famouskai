/**
 * Famouskai syntax sample: TypeScript (opened with ace/mode/javascript, like .js files).
 *
 * Type declarations for the part of the Famouskai plugin API that tools use, written as
 * a contributor would to get autocompletion in another editor. Famouskai itself is plain
 * JavaScript with no build step: this file is documentation, never compiled or loaded.
 */

// ﹥ 1. Famous Marks
export type MarkName = 'arrow' | 'magic' | 'bubble';
export type MarkChar = '﹥' | '•' | '°';   // ﹥ • °

export interface MarkDefinition {
    readonly char: MarkChar;
    readonly label: string;
}

export interface FamousMarkApi {
    readonly MARKS: Readonly<Record<MarkName, MarkDefinition>>;
    readonly CHAR_CLASS: string;
    readonly PREFIX_CLASS: string;
    readonly regex: RegExp;
    test(line: string): boolean;
    match(line: string): RegExpMatchArray | null;
}

// ﹥ 2. Tools
export const enum ToolScope {
    AllFiles = 0,
    Markdown = 1 << 0,
    Code = 1 << 1,
}

/** Extensions a tool accepts; '' stands for an unsaved [New] document. */
export type Extension = '' | 'md' | 'txt' | 'js' | 'ts' | 'json' | 'css' | 'html' | 'xml' | 'yml' | 'csv' | 'tsv' | 'log';

export interface ToolDefinition<TResult = void> {
    name: string;
    extensions: Extension[];          // [] = every file type
    action(editor: AceEditorLike): TResult | Promise<TResult>;
}

/** The few Ace editor methods tools need (Ace ships its own, larger, typings). */
export interface AceEditorLike {
    getValue(): string;
    getSelectedText(): string;
    session: { replace(range: unknown, text: string): void; getLength(): number };
}

// ﹥ 3. Generic helpers
type Awaitable<T> = T | Promise<T>;
type ReadonlyDeep<T> = { readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K] };
type ToolEvent = `tool:${'before' | 'after'}-run`;
type Separator = ReturnType<CsvModeApi['detectSeparator']>;

export interface CsvModeApi {
    detectSeparator(text: string): ',' | ';' | '\t' | '|';
}

/** Identity helper, generic over the type of its argument. */
function keep<T>(value: T): T {
    return value;
}
export const NO_LIMIT = keep(Infinity);   // no length limit

function isToolDefinition(value: unknown): value is ToolDefinition<unknown> {
    return typeof value === 'object' && value !== null
        && typeof (value as ToolDefinition).name === 'string' && (value as ToolDefinition).name.length > 0
        && Array.isArray((value as ToolDefinition).extensions);
}

export function defineTool<TResult>(tool: ToolDefinition<TResult>): ToolDefinition<TResult> {
    if (!isToolDefinition(tool)) throw new TypeError(`Invalid tool: ${String(tool)}`);
    return tool;
}

// ﹥ 4. The global namespace, as it exists at run time
declare global {
    interface Window {
        FamousPluginCore: {
            Manager: { register<T>(tool: ToolDefinition<T>): void };
            FamousMark: FamousMarkApi;
            CsvMode: CsvModeApi;
            YamlFolding: { apply(session: object): void };
            PreviewCode: { process(rootEl: HTMLElement): void };
        };
        currentFileName?: string;
        showToast?: (message: string, durationMs?: number) => void;
    }
}

// ﹥ 5. A typed tool, with a decorator that times each run
function timed<This, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
    return function (this: This, ...args: Args): Return {
        const started = performance.now();
        try {
            return target.call(this, ...args);
        } finally {
            console.debug(`${String(context.name)} took ${(performance.now() - started).toFixed(1)} ms`);
        }
    };
}

abstract class TextTool<TOptions extends object = {}> {
    protected abstract readonly label: string;
    constructor(protected readonly options: Readonly<TOptions>) {}
    abstract transform(text: string): string;
}

class UpperCaseTool extends TextTool<{ keepAcronyms: boolean }> {
    protected readonly label = 'Upper Case' as const;

    @timed
    transform(text: string): string {
        return this.options.keepAcronyms
            ? text.replace(/\b[a-z]+\b/g, (word) => word.toUpperCase())
            : text.toUpperCase();
    }
}

const upperCase = new UpperCaseTool({ keepAcronyms: false });

window.FamousPluginCore.Manager.register(defineTool<void>({
    name: 'Upper Case (typed sample)',
    extensions: ['md', 'txt', ''],
    action(editor) {
        const before = editor.getSelectedText();
        if (!before) return window.showToast?.('Select some text first');
        const after = upperCase.transform(before) satisfies string;
        console.log({ before, after, scope: ToolScope.Markdown | ToolScope.Code } as const);
    },
}));

export type { Awaitable, ReadonlyDeep, ToolEvent, Separator };

// ﹥ 6. Known limitation, kept last on purpose
// Famouskai opens .ts files with Ace's JavaScript mode (Ace has no TypeScript mode).
// A generic arrow function such as `<T>(value: T) => value` is read as a JSX tag: "<T>" is
// colored as a generic (the --js-generics-* tokens), and the rest of the line, up to the next
// closing tag, as JSX text. Write `function name<T>()` instead when the coloring matters.
export const identity = <T,>(value: T): T => value;
