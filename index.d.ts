import { InspectOptions } from "node:util";
import { Direction } from "tty";

export interface Modifiers {
   modifier: {
      reset: (input: string) => string,
      // 21 isn't widely supported and 22 does the same thing
      bold: (input: string) => string,
      dim: (input: string) => string,
      italic: (input: string) => string,
      underline: (input: string) => string,
      inverse: (input: string) => string,
      hidden: (input: string) => string,
      strikethrough: (input: string) => string,
   },
   color: {
      black: (input: string) => string,
      red: (input: string) => string,
      green: (input: string) => string,
      yellow: (input: string) => string,
      blue: (input: string) => string,
      magenta: (input: string) => string,
      cyan: (input: string) => string,
      white: (input: string) => string,
      grey: (input: string) => string,

      // Bright color
      blackBright: (input: string) => string,
      redBright: (input: string) => string,
      greenBright: (input: string) => string,
      yellowBright: (input: string) => string,
      blueBright: (input: string) => string,
      magentaBright: (input: string) => string,
      cyanBright: (input: string) => string,
      whiteBright: (input: string) => string,
   },
   bgColor: {
      bgBlack: (input: string) => string,
      bgRed: (input: string) => string,
      bgGreen: (input: string) => string,
      bgYellow: (input: string) => string,
      bgBlue: (input: string) => string,
      bgMagenta: (input: string) => string,
      bgCyan: (input: string) => string,
      bgWhite: (input: string) => string,
      bgGrey: (input: string) => string,

      // Bright color
      bgBlackBright: (input: string) => string,
      bgRedBright: (input: string) => string,
      bgGreenBright: (input: string) => string,
      bgYellowBright: (input: string) => string,
      bgBlueBright: (input: string) => string,
      bgMagentaBright: (input: string) => string,
      bgCyanBright: (input: string) => string,
      bgWhiteBright: (input: string) => string,
   },
}

export interface LixStyles {
   reset: (input: string) => string,
   // 21 isn't widely supported and 22 does the same thing
   bold: (input: string) => string,
   dim: (input: string) => string,
   italic: (input: string) => string,
   underline: (input: string) => string,
   inverse: (input: string) => string,
   hidden: (input: string) => string,
   strikethrough: (input: string) => string,

   black: (input: string) => string,
   red: (input: string) => string,
   green: (input: string) => string,
   yellow: (input: string) => string,
   blue: (input: string) => string,
   magenta: (input: string) => string,
   cyan: (input: string) => string,
   white: (input: string) => string,

   // Bright color
   blackBright: (input: string) => string,
   redBright: (input: string) => string,
   greenBright: (input: string) => string,
   yellowBright: (input: string) => string,
   blueBright: (input: string) => string,
   magentaBright: (input: string) => string,
   cyanBright: (input: string) => string,
   whiteBright: (input: string) => string,

   bgBlack: (input: string) => string,
   bgRed: (input: string) => string,
   bgGreen: (input: string) => string,
   bgYellow: (input: string) => string,
   bgBlue: (input: string) => string,
   bgMagenta: (input: string) => string,
   bgCyan: (input: string) => string,
   bgWhite: (input: string) => string,

   // Bright color
   bgBlackBright: (input: string) => string,
   bgRedBright: (input: string) => string,
   bgGreenBright: (input: string) => string,
   bgYellowBright: (input: string) => string,
   bgBlueBright: (input: string) => string,
   bgMagentaBright: (input: string) => string,
   bgCyanBright: (input: string) => string,
   bgWhiteBright: (input: string) => string,
}

export interface NiceLogOptions {

   stdout?: NodeJS.WritableStream | undefined;
   stderr?: NodeJS.WritableStream | undefined;

   showDateAtStart?: false | boolean | undefined;
   alternateBackground?: false | boolean | undefined;

   withType?: true | boolean | undefined;
   withMillis?: false | boolean | undefined;

   //ignoreErrors?: true | boolean | undefined;
   inspectOptions?: InspectOptions | undefined;
   //groupIndentation?: 2 | number | undefined;

   console?: Console;
}

export class NiceConsole {
   write_err(chunk: ArrayBufferLike | string, encoding?: BufferEncoding): boolean;

   write(chunk: ArrayBufferLike | string, encoding?: BufferEncoding): boolean;

   clearLine(dir: Direction, callback?: () => void): boolean;

   clearScreenDown(callback?: () => void): boolean;

   cursorTo(x: number, y?: number, callback?: () => void): boolean;
   cursorTo(x: number, callback: () => void): boolean;

   moveCursor(dx: number, dy: number, callback?: () => void): boolean;

   getColorDepth(env?: object): number;

   hasColors(count?: number): boolean;
   hasColors(env?: object): boolean;
   hasColors(count: number, env?: object): boolean;

   getWindowSize(): [number, number];

   get columns(): number;

   get rows(): number;

   get isTTY(): boolean;

   assert(condition?: boolean, ...data: any[]): void;

   clear(): void;

   count(label?: string): void;

   countReset(label?: string): void;

   debug(...data: any[]): void;

   dir(item?: any, options?: any): void;

   dirxml(...data: any[]): void;

   error(...data: any[]): void;

   group(...data: any[]): void;

   groupCollapsed(...data: any[]): void;

   groupEnd(): void;

   info(...data: any[]): void;

   log(...data: any[]): void;

   table(tabularData?: any, properties?: string[]): void;

   time(label?: string): void;

   timeEnd(label?: string): void;

   timeLog(label?: string, ...data: any[]): void;

   timeStamp(label?: string): void;

   trace(...data: any[]): void;

   warn(...data: any[]): void;
}

export interface NiceLogExports {
   console: NiceConsole,
   chalk: LixStyles,
   trimAnsi: (input: string) => string
}

export type styles = LixStyles;

export default function NiceLog(con: Console, options?: NiceLogOptions): NiceLogExports;
