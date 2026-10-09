export interface FriendlyError {
  title: string;
  advice: string;
  hint: string;
  raw: string;
}

/**
 * Translates intimidating Python stack traces into encouraging,
 * plain-English explanations tailored for primary school learners.
 */
export function translatePythonError(rawError: string): FriendlyError {
  if (!rawError) {
    return {
      title: "Hmm, something didn't go quite right",
      advice: "Take a close look at your code and try running it step-by-step.",
      hint: "Check spelling, punctuation, and indentation.",
      raw: rawError
    };
  }

  // Timeout / Infinite loop
  if (rawError.includes("TimeoutError") || rawError.includes("Execution timed out")) {
    return {
      title: "⏳ Endless Loop Alert!",
      advice: "Your program ran for too long (over 5 seconds) without stopping.",
      hint: "If you used a `while` loop, make sure the condition can eventually become False!",
      raw: rawError
    };
  }

  // SyntaxError: unexpected EOF
  if (rawError.includes("unexpected EOF while parsing")) {
    return {
      title: "🧩 Missing Closing Symbol!",
      advice: "Python reached the very end of your code while still waiting for something to be closed.",
      hint: "Check your parentheses `( )`, quotes `\" \"` or `' '`, or brackets `[ ]`. Make sure every opener has a partner!",
      raw: rawError
    };
  }

  // SyntaxError: invalid syntax with colon hint
  if (rawError.includes("SyntaxError: invalid syntax")) {
    return {
      title: "🧐 Python Grammar Puzzle!",
      advice: "Python couldn't understand this line of code.",
      hint: "Did you forget a colon `:` after an `if`, `else`, `elif`, or `for` line? Or maybe you have extra or missing quotes?",
      raw: rawError
    };
  }

  // SyntaxError: invalid character
  if (rawError.includes("invalid character")) {
    return {
      title: "🔤 Fancy Character Detected!",
      advice: "You might have typed a 'curly' quote from a document or an unsupported symbol.",
      hint: "Try retyping quotes `\"` or single quotes `'` directly with your keyboard.",
      raw: rawError
    };
  }

  // IndentationError: expected an indented block
  if (rawError.includes("IndentationError: expected an indented block")) {
    return {
      title: "📏 Missing 4-Space Indent!",
      advice: "Python requires code inside an `if`, `else`, `for`, or function to be indented (pushed to the right).",
      hint: "Press the Tab key or add 4 spaces at the start of the line right after your colon `:`.",
      raw: rawError
    };
  }

  // IndentationError: unindent does not match
  if (rawError.includes("IndentationError")) {
    return {
      title: "📐 Spacing Mismatch!",
      advice: "The spaces at the start of your line don't line up with the rest of your code.",
      hint: "Make sure all lines in the same block have the exact same number of spaces at the beginning.",
      raw: rawError
    };
  }

  // NameError: name 'xxx' is not defined
  const nameErrorMatch = rawError.match(/NameError: name '([^']+)' is not defined/);
  if (nameErrorMatch) {
    const varName = nameErrorMatch[1];
    let customHint = `Check if you spelled '${varName}' correctly, or create it with '${varName} = ...' first.`;
    if (varName === 'pritn' || varName === 'prnt' || varName === 'printt') {
      customHint = `It looks like a typo for Python's print command! Change '${varName}' to 'print'.`;
    } else if (varName === 'intput' || varName === 'inpt') {
      customHint = `It looks like a typo for 'input'! Change '${varName}' to 'input'.`;
    } else if (varName === 'true' || varName === 'false') {
      customHint = `Python needs a capital letter for Booleans: use 'True' or 'False'.`;
    }

    return {
      title: `🔍 Mystery Word: '${varName}'!`,
      advice: `Python doesn't know what '${varName}' means yet.`,
      hint: customHint,
      raw: rawError
    };
  }

  // TypeError: can only concatenate str (not "int") to str
  if (rawError.includes("can only concatenate str") || (rawError.includes("TypeError") && rawError.includes("str") && rawError.includes("int"))) {
    return {
      title: "🔀 Text and Number Mashup!",
      advice: "You tried to glue together text and a number using the `+` sign.",
      hint: "In Python, use commas inside print (e.g., `print(\"Score:\", score)`) or convert the number with `str(score)`.",
      raw: rawError
    };
  }

  // ValueError: invalid literal for int()
  if (rawError.includes("ValueError: invalid literal for int()")) {
    return {
      title: "🔢 Not a Number!",
      advice: "You used `int()` to turn text into a whole number, but the text had letters or symbols in it.",
      hint: "Make sure the input is digits only (like '42') before passing it to `int()`.",
      raw: rawError
    };
  }

  // ZeroDivisionError
  if (rawError.includes("ZeroDivisionError")) {
    return {
      title: "🍕 Cannot Divide by Zero!",
      advice: "In math and computer science, you cannot divide any number by zero.",
      hint: "Check the number on the right side of your `/` or `//` sign.",
      raw: rawError
    };
  }

  // IndexError
  if (rawError.includes("IndexError: list index out of range")) {
    return {
      title: "🎯 List Index Out of Bounds!",
      advice: "You asked Python to grab an item from a list at a position that doesn't exist.",
      hint: "Remember: Python lists start counting at 0! If a list has 3 items, their positions are 0, 1, and 2.",
      raw: rawError
    };
  }

  // KeyError
  if (rawError.includes("KeyError")) {
    return {
      title: "🗝️ Key Not Found!",
      advice: "You asked a dictionary for a key that isn't inside it.",
      hint: "Double check the spelling of your key name.",
      raw: rawError
    };
  }

  // Generic fallback
  return {
    title: "🐛 Bug Detected!",
    advice: "Python ran into an unexpected hiccup while executing your program.",
    hint: "Read the line number highlighted below, compare your code with the instructions, and try again!",
    raw: rawError
  };
}
