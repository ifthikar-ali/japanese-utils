# Japanese Utils

Japanese Utils is a JavaScript library that provides utility functions for manipulating Japanese text. This package includes functions for converting between full-width and half-width ASCII characters, katakana, and romaji, as well as functions for parsing and formatting Japanese era dates.

## Features

- Convert between full-width and half-width ASCII characters.
- Convert between half-width and full-width katakana.
- Normalize Unicode strings.
- Normalize spaces in strings.
- Convert between hiragana and katakana.
- Convert romaji to katakana.
- Parse and format Japanese era dates.

## Installation

To install the package, use npm:

```bash
npm install japanese-utils
```

## Usage

Here are some examples of how to use the functions provided by the library:

### Convert Full-width ASCII to Half-width ASCII

```javascript
import { toHalfWidthAscii } from 'japanese-utils';

const halfWidth = toHalfWidthAscii('Ｈｅｌｌｏ　Ｗｏｒｌｄ');
console.log(halfWidth); // Output: Hello World
```

### Convert Half-width Katakana to Full-width Katakana

```javascript
import { toFullWidthKanaFromHalf } from 'japanese-utils';

const fullWidthKana = toFullWidthKanaFromHalf('ｷｬ');
console.log(fullWidthKana); // Output: キャ
```

### Normalize Unicode

```javascript
import { normalizeUnicode } from 'japanese-utils';

const normalized = normalizeUnicode('some string', 'NFKC');
console.log(normalized);
```

### Parse Japanese Era Date

```javascript
import { parseJapaneseEraDate } from 'japanese-utils';

const isoDate = parseJapaneseEraDate('令和3年5月1日');
console.log(isoDate); // Output: 2021-05-01
```

### Format Japanese Date

```javascript
import { formatJapaneseDate } from 'japanese-utils';

const formattedDate = formatJapaneseDate(new Date(), { format: 'jp' });
console.log(formattedDate); // Output: Current date in Japanese format
```

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.