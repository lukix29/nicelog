const FS = require("fs");
const {Duplex} = require("stream");
const {formatWithOptions, inspect} = require("util");
const TTY = require("tty");
const {Direction} = require("tty");

class StdStream extends Duplex {
   constructor(stdio_stream) {
      super();

      this.allowHalfOpen = true;

      this._stdio = stdio_stream;
   }

   _read(size) {

   }

   // Writes the data, push and set the delay/timeout
   _write(chunk, encoding, callback) {
      if(this._stdio) this._stdio.write(chunk);
      this.push(trimAnsi(chunk.toString()), "utf8");
      callback();
   }

   // When all the data is done passing, it stops.
   _final() {
      this.push(null);
   }
}

const AnsiStyles = Object.freeze({
   modifier: {
      reset: [0, 0],
      // 21 isn't widely supported and 22 does the same thing
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29],
   },
   color: {
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],
      grey: [90, 39],

      // Bright color
      blackBright: [90, 39],
      redBright: [91, 39],
      greenBright: [92, 39],
      yellowBright: [93, 39],
      blueBright: [94, 39],
      magentaBright: [95, 39],
      cyanBright: [96, 39],
      whiteBright: [97, 39],
   },
   bgColor: {
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],
      bgGrey: [100, 49],

      // Bright color
      bgBlackBright: [100, 49],
      bgRedBright: [101, 49],
      bgGreenBright: [102, 49],
      bgYellowBright: [103, 49],
      bgBlueBright: [104, 49],
      bgMagentaBright: [105, 49],
      bgCyanBright: [106, 49],
      bgWhiteBright: [107, 49],
   },
});

// @formatter:off
/**
 * @type {Modifiers}
 */
const Styles = Object.freeze(Object.fromEntries(Object.entries(AnsiStyles).map(([type, values]) => ([type, Object.fromEntries(Object.entries(values).map(([color, style]) => ([color, (input) => (`\u001B[${style[0]}m${input}\u001B[${style[1]}m`)])))]))));
// @formatter:on

const chalk = {...Styles.color, ...Styles.bgColor, ...Styles.modifier};

/**
 * ConsoleStyleInjects
 * @type {Readonly<{warn: (input: string) => string, debug: (input: string) => string, log: (input: string) => string, error: (input: string) => string, info: (input: string) => string}>}
 */
const ConsoleStyleInjects = Object.freeze({
   "log": (s) => chalk.white(s),
   "warn": (s) => chalk.italic(chalk.yellow(s)),
   "info": (s) => chalk.cyan(s),
   "debug": (s) => chalk.blueBright(s),
   "error": (s) => chalk.bold(chalk.red(s)),
});

/**
 * WeekDays
 * @type {Readonly<string[]>}
 */
const WeekDays = Object.freeze([
   "Sunday",
   "Monday",
   "Tuesday",
   "Wednesday",
   "Thursday",
   "Friday",
   "Saturday",
]);

const AnsiRegex = new RegExp("[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))", "g");

function trimAnsi(input) {
   return input.replace(AnsiRegex, "");
}

/**
 * getDateTime
 * @param {boolean} [withMillis]
 * @return {string}
 */
function getDateTime(withMillis = false) {
   const date = new Date();
   const parts = [date.getHours(), date.getMinutes(), date.getSeconds()].map((t) => ((t < 10) ? "0" + t : t.toString()));
   return `${parts[0]}:${parts[1]}:${parts[2]}` + (withMillis ? `.${date.getMilliseconds()}` : "");
}

/**
 * getDateString
 * @param {Date} date
 * @param {boolean} [withDayName]
 * @return {string}
 */
function getDateString(date, withDayName = true) {
   return `${withDayName ? WeekDays[date.getDay()] + ", " : ""}${`${date.getDate()}`.padStart(2, "0")}.${`${date.getMonth() + 1}`.padStart(2, "0")}.${`${date.getFullYear()}`}`;
}

/**
 * NiceLog
 * @param {Console} con
 * @param {NiceLogOptions} [options]
 * @return {console}
 */
function NiceLog(con, options) {

   const DefaultInspectConfig = {
      showHidden: false,
      depth: 4,
      colors: true,
      customInspect: true,
      showProxy: false,
      maxArrayLength: 100,
      maxStringLength: 1000,
      breakLength: 80,
      compact: 3,
      sorted: false,
      getters: false,
      numericSeparator: true,
   };

   /**
    * @type {NiceLogOptions}
    */
   const DefaultConfig = {

      showDateAtStart: false,
      alternateBackground: false,

      withType: true,
      withMillis: false,

      stdout: process.stdout,
      stderr: process.stderr,

      ignoreErrors: true,
      colorMode: true,
      groupIndentation: 2,
      inspectOptions: {...DefaultInspectConfig},
   };

   if(options === null || (typeof options !== "object")) {
      if((con !== null || (typeof con !== "object")) && !(con instanceof console.Console)) {
         options = {...DefaultConfig};
      } else {
         options = {...DefaultConfig, ...con};
         options.inspectOptions = {...DefaultInspectConfig, ...options.inspectOptions};
      }
   } else {
      options = {...DefaultConfig, ...options};
      options.inspectOptions = {...DefaultInspectConfig, ...options.inspectOptions};
   }

   if(!(con instanceof console.Console)) con = options.console || console;

   const maxPreLength = 9 + (options.withMillis ? 4 : 0) + (options.withType ? 6 : 0);

   /*   const xcon = new console.Console({
    stdout: options.stdout,
    stderr: options.stderr,

    ignoreErrors: options.ignoreErrors,
    //colorMode: true,
    groupIndentation: options.groupIndentation,
    inspectOptions: options.inspectOptions,

    //groupIndentation: 16,
    //inspectOptions: {
    // /!**
    //  * If set to `true`, getters are going to be
    //  * inspected as well. If set to `'get'` only getters without setter are going
    //  * to be inspected. If set to `'set'` only getters having a corresponding
    //  * setter are going to be inspected. This might cause side effects depending on
    //  * the getter function.
    //  * @default `false`
    //  *!/
    // getters: true,
    // showHidden: true,
    // /!**
    //  * @default 2
    //  *!/
    // depth: 4,
    // colors: true,
    // customInspect: true,
    // showProxy: true,
    // maxArrayLength: 10,
    // /!**
    //  * Specifies the maximum number of characters to
    //  * include when formatting. Set to `null` or `Infinity` to show all elements.
    //  * Set to `0` or negative to show no characters.
    //  * @default 10000
    //  *!/
    // maxStringLength: 1024,
    // breakLength: 512,
    // /!**
    //  * Setting this to `false` causes each object key
    //  * to be displayed on a new line. It will also add new lines to text that is
    //  * longer than `breakLength`. If set to a number, the most `n` inner elements
    //  * are united on a single line as long as all properties fit into
    //  * `breakLength`. Short array elements are also grouped together. Note that no
    //  * text will be reduced below 16 characters, no matter the `breakLength` size.
    //  * For more information, see the example below.
    //  * @default `true`
    //  *!/
    // compact: true,
    // sorted: true,
    //},
    }); */

   function getPadding(key) {
      const padLength = (maxPreLength - (((options.withMillis ? 12 : 8) + 2) + ((options.withType ? key.length : 0))));
      return ("").padEnd(padLength, " ");
   }

   function getPrefix(key) {
      const style = ConsoleStyleInjects[key];
      return (`${Styles.color.grey(getDateTime(options.withMillis))} `) +
             (options.withType ? (`${chalk.underline(style(key.toUpperCase()))}` + getPadding(key)) : "") + style("> ");
   }

   function writeDateChange() {
      const now = new Date();
      if(now.getDate() > lastLogDate.getDate()) {
         const dateString = getDateString(now);
         const fStr = Styles.color.blueBright("─") + ("").padEnd(dateString.length, "─") + Styles.color.blueBright("─");
         process.stdout.write(`\r\n┌${fStr}┐\r\n${Styles.color.blueBright("│")} ${dateString} ${Styles.color.blueBright("│")}\r\n└${fStr}┘\r\n`);
      }
      lastLogDate = now;
   }

   function write(key, value) {
      if(key === "error" || key === "warn") {
         options.stderr.write(value);
      } else {
         options.stdout.write(value);
      }
   }

   let bgSwitch = false;
   const bgSwitchColor = AnsiStyles.bgColor.bgBlackBright;
   const switchColor = AnsiStyles.color.whiteBright;

   let lastLogDate = (options.showDateAtStart) ? new Date(0) : new Date();
   Object.entries(ConsoleStyleInjects).forEach(([key, style]) => {
      // const orig = xcon[key];
      con[key] = function() {
         writeDateChange();

         let prefix = getPrefix(key);
         if(bgSwitch) prefix += (`\u001B[${bgSwitchColor[0]}m\u001B[${switchColor[0]}m`);
         // orig.apply(xcon, arguments);

         prefix += formatWithOptions(options.inspectOptions, "", ...arguments);

         if(bgSwitch) prefix += `\u001B[${switchColor[1]}m\u001B[${bgSwitchColor[1]}m`;

         if(options.alternateBackground) bgSwitch = !bgSwitch;

         write(key, prefix);

         //process.stdout.moveCursor(0, -1);
         // if(key === "error" || key === "warn") process.stderr.write(style(chalk.bold(" ◀\n")));
         // else process.stdout.write(style(chalk.bold(" ◀\n")));
      };
   });

   con["write_err"] = function(chunk, encoding) {
      return options.stderr.write(chunk, encoding);
   };

   con["write"] = function(chunk, encoding) {
      return options.stdout.write(chunk, encoding);
   };

   con["println"] = function(line = "") {
      return options.stdout.write(line + "\r\n", "utf8");
   };

   [
      ["clearLine", "value"],
      ["clearScreenDown", "value"],
      ["cursorTo", "value"],
      ["moveCursor", "value"],
      ["getColorDepth", "value"],
      ["hasColors", "value"],
      ["getWindowSize", "value"],
      ["columns", "get"],
      ["rows", "get"],
      ["isTTY", "get"],
   ].forEach(([k, type]) => {
      if(type === "value") {
         Reflect.defineProperty(console, k, {
            writable: true,
            enumerable: true,
            configurable: true,
            value: process.stdout[k],
         });
      } else {
         Reflect.defineProperty(console, k, {
            enumerable: true,
            configurable: true,
            get() {return process.stdout[k];},
         });
      }
   });
   return {console: con, chalk, trimAnsi};
}

module.exports = NiceLog;
/**
 * @type {LixStyles}
 */
module.exports.chalk = chalk;
module.exports.styles = Styles;
module.exports.AnsiStyles = AnsiStyles;
module.exports.trimAnsi = trimAnsi;
