export type ToolGuide = {
  overview: string;
  steps: [string, string, string];
  example: string;
  tip: string;
  faqs: [{ question: string; answer: string }, { question: string; answer: string }];
};

export const toolGuides: Record<string, ToolGuide> = {
  "image-compressor": {
    overview: "Image compression reduces the amount of data stored in an image so it is easier to upload, share and store. The right balance depends on the image: photographs can usually tolerate more compression than screenshots containing small text.",
    steps: ["Choose an image from your device and check its original dimensions and file size.", "Select a suitable output quality or compression setting, then run the compressor.", "Preview the result at normal viewing size and download it if the detail and file size meet your needs."],
    example: "Use a compressed copy of a large product photograph when a website upload limit rejects the original. Keep the original file as your editable master.",
    tip: "Do not judge compression only by the percentage saved. Zoom in on fine text, edges and gradients before replacing an original.",
    faqs: [{ question: "Will compression change image dimensions?", answer: "Compression and resizing are different operations. A compressor normally focuses on file size; use the image resizer when you need specific pixel dimensions." }, { question: "Should I delete the original image?", answer: "Keep the original until you have checked the downloaded copy and confirmed that it is suitable for its intended use." }]
  },
  "image-converter": {
    overview: "An image converter changes an image from one supported file format to another. Formats make different trade-offs: JPEG is common for photographs, PNG supports lossless graphics and transparency, and WebP can provide efficient web images.",
    steps: ["Select the source image from your device.", "Choose an output format that supports the features you need, especially transparency.", "Convert the image, then open the downloaded file to confirm that it displays correctly."],
    example: "Convert a PNG photograph to JPEG when you need a smaller photo file and do not need a transparent background.",
    tip: "JPEG does not preserve transparency. Choose PNG or another transparency-capable format when transparent pixels matter.",
    faqs: [{ question: "Does converting a format always reduce file size?", answer: "No. The result depends on the source format, image content, output format and quality settings." }, { question: "Will the image look exactly the same?", answer: "Lossless conversion can preserve image data, while lossy formats or quality settings can change detail. Always preview the result." }]
  },
  "image-cropper": {
    overview: "Cropping removes unwanted outer areas of an image and changes its visible composition. It is useful for focusing attention, preparing profile pictures and matching a required aspect ratio without stretching the subject.",
    steps: ["Load the image and identify the subject or area that should remain visible.", "Adjust the crop area or aspect ratio while keeping important details inside the frame.", "Apply the crop and download the result after checking its edges."],
    example: "Crop a wide photograph to a square composition for a profile image while keeping the subject centred.",
    tip: "Leave a little breathing room around faces, text and logos so the crop does not feel cramped on different screens.",
    faqs: [{ question: "Is cropping the same as resizing?", answer: "No. Cropping removes parts of the image; resizing changes the pixel dimensions of the image that remains." }, { question: "Can I undo a crop after downloading?", answer: "The downloaded crop is a separate output. Keep the original image if you may want to choose a different crop later." }]
  },
  "image-resizer": {
    overview: "Image resizing changes an image's pixel width and height. Correct dimensions help images fit website layouts, forms and social platforms without relying on a browser to scale oversized files.",
    steps: ["Select an image and note its current width and height.", "Enter the target dimensions, keeping the aspect ratio locked when you want to avoid distortion.", "Resize, preview the output and download the new image."],
    example: "Create a smaller 1200-pixel-wide copy of a large photograph for a page that does not need the original camera resolution.",
    tip: "Keep the aspect ratio linked for ordinary photographs. Enter independent width and height values only when distortion is intentional.",
    faqs: [{ question: "Will making an image larger improve its quality?", answer: "Upscaling adds pixels but cannot recreate detail that was not present in the original." }, { question: "What dimensions should I use?", answer: "Use the pixel dimensions required by the destination. If none are specified, start with the display size and allow a little extra for high-density screens." }]
  },
  "images-to-pdf": {
    overview: "An images-to-PDF tool places selected images into a single document. It is useful for turning scanned pages, receipts or a sequence of pictures into one file that is easier to share and archive.",
    steps: ["Select the images you want to include and arrange them in the intended page order.", "Check that each image is upright and legible, especially small text near page edges.", "Create the PDF and open the downloaded document to verify page order and appearance."],
    example: "Combine photographs of several paper receipts into one PDF before sending them as a single attachment.",
    tip: "Photograph documents in even light and keep the camera parallel to the page for more readable PDF pages.",
    faqs: [{ question: "Can one PDF contain multiple images?", answer: "Yes. Each selected image is placed into the generated document as a page or page content according to the tool's layout." }, { question: "Are the selected images uploaded?", answer: "Toolora's image and PDF workflows are designed for local browser processing. Your files are not sent to a Toolora processing server." }]
  },
  "pdf-to-images": {
    overview: "PDF-to-image conversion renders PDF pages as image files. This is useful when a page needs to be inserted into a presentation, shared as a preview or viewed in an environment without a PDF reader.",
    steps: ["Choose a PDF file from your device and wait for its pages to load.", "Select the page or output settings offered by the workspace.", "Export the pages and inspect the downloaded images for readable text and correct orientation."],
    example: "Export the cover page of a report as an image to use as a visual preview in a presentation.",
    tip: "Higher image resolution improves small-text readability but also creates larger image files.",
    faqs: [{ question: "Does this convert selectable PDF text into editable text?", answer: "No. Rendering creates page images. Use an OCR application when you need text recognition from scanned pages." }, { question: "Why can a large PDF take longer?", answer: "Rendering requires the browser to decode and draw each page. Large page counts and high output resolution require more memory and processing." }]
  },
  "case-converter": {
    overview: "A case converter changes the capitalization pattern of existing text. It can quickly standardize headings, labels and drafts without requiring you to retype the content.",
    steps: ["Paste or type the text you want to transform.", "Choose the target case, such as uppercase, lowercase, title case or sentence case.", "Run the conversion and review names, abbreviations and product terms before copying the result."],
    example: "Convert a list of headings to sentence case to make capitalization consistent across a document.",
    tip: "Automatic title and sentence casing cannot know every brand name or writing convention. Proofread proper nouns and acronyms.",
    faqs: [{ question: "Does changing case alter the wording?", answer: "The converter changes letter capitalization, not the intended wording. Review punctuation and special names afterward." }, { question: "Can I convert several paragraphs at once?", answer: "Yes. Paste the full text when you want the same case transformation applied throughout." }]
  },
  "lorem-ipsum-generator": {
    overview: "Lorem Ipsum is placeholder text used to test the visual shape of a layout before final copy is ready. It helps designers evaluate spacing, line length and content density without presenting draft wording as finished editorial content.",
    steps: ["Choose the amount of placeholder text you need using the available paragraph or word controls.", "Generate the sample and check whether its length resembles the content the layout will eventually contain.", "Copy or download the text, then replace it with reviewed final copy before publishing."],
    example: "Generate a few paragraphs to test how an article card or landing-page section behaves with realistic text length.",
    tip: "Placeholder text is for layout testing only. Replace it before launch so visitors and search engines receive useful, accurate information.",
    faqs: [{ question: "Is Lorem Ipsum meaningful content?", answer: "No. It is conventional placeholder copy and should not be used as a substitute for original page content." }, { question: "How much text should I generate?", answer: "Generate enough to represent the expected content length, including short and long sections that may affect the layout." }]
  },
  "markdown-editor": {
    overview: "Markdown is a lightweight syntax for writing structured text with headings, lists, links, emphasis and code. A live preview helps you check the rendered structure while keeping the source easy to edit.",
    steps: ["Write or paste Markdown in the editor pane.", "Use heading markers, list markers, links and code fences to structure the document.", "Review the preview for hierarchy and formatting, then copy or download the Markdown source."],
    example: "Draft a README with a project heading, installation steps, a feature list and a fenced code example.",
    tip: "Use headings in a logical order and descriptive link text. Avoid using formatting as a substitute for clear document structure.",
    faqs: [{ question: "Is Markdown the same as HTML?", answer: "No. Markdown is a simpler authoring syntax that can be rendered into HTML by a compatible parser." }, { question: "Will the preview run embedded scripts?", answer: "The preview is intended for formatted content, not as a place to execute arbitrary scripts. Do not paste untrusted code into other applications." }]
  },
  "remove-duplicate-lines": {
    overview: "Duplicate-line removal cleans lists by keeping one occurrence of repeated lines. It is useful for consolidating copied data, cleaning keyword lists and preparing unique values for another workflow.",
    steps: ["Paste the list, with one item on each line.", "The tool treats lines as duplicates when their trimmed text matches without regard to letter case.", "Run the cleanup and compare the output with the original. The first occurrence is kept and the remaining lines stay in their original order."],
    example: "Remove repeated entries from a pasted list of email subject ideas or product labels before sorting it.",
    tip: "If capitalization or whitespace distinguishes meaningful values in your data, preserve those differences rather than normalizing them automatically.",
    faqs: [{ question: "Does the order of unique lines stay the same?", answer: "Check the selected options and preview the result. Some cleanup workflows preserve first occurrence order, while sorting is a separate operation." }, { question: "Can blank lines be removed too?", answer: "Use the available blank-line or whitespace options if present, and inspect the output when empty lines have meaning." }]
  },
  "slug-generator": {
    overview: "A URL slug is the readable part of a web address that identifies a page. A clear slug uses concise words and separators so people can understand the destination before opening it.",
    steps: ["Enter the title or phrase that should describe the destination page.", "Generate a slug and check that important keywords remain while unnecessary words are removed only when appropriate.", "Copy the result into your content system and confirm that the final URL resolves correctly."],
    example: "Turn the article title 'A Beginner Guide to Image Compression' into a short, hyphen-separated page identifier.",
    tip: "Keep published slugs stable. If you change an existing URL, configure a permanent redirect so old links do not break.",
    faqs: [{ question: "Should a slug contain spaces?", answer: "Readable URL slugs commonly use hyphens instead of spaces." }, { question: "Does a keyword-rich slug guarantee search rankings?", answer: "No. A descriptive URL can improve clarity, but search visibility depends on many factors including useful content and overall site quality." }]
  },
  "text-analyzer": {
    overview: "A text analyzer reports measurable properties of a passage, such as word count, character count, sentence count and reading-related statistics. These measurements help writers check length and structure.",
    steps: ["Paste the text you want to inspect into the input area.", "Run the analysis and review the available counts and estimates.", "Use the results to edit the passage, then analyze it again to check the effect of your changes."],
    example: "Check whether a draft fits a word limit before submitting it to a form or editorial brief.",
    tip: "Reading-time and readability scores are estimates. They do not account for every language, audience or subject-specific term.",
    faqs: [{ question: "Why can word counts differ between tools?", answer: "Tools may treat contractions, hyphenated terms, symbols and languages differently. Use one consistent counting method for a specific requirement." }, { question: "Does the analyzer save my text?", answer: "The text-analysis operation runs in your browser; avoid entering confidential material on shared devices." }]
  },
  "text-cleaner": {
    overview: "A text cleaner normalizes common formatting problems such as repeated spaces, inconsistent line breaks and unwanted whitespace. It is useful after copying content from PDFs, spreadsheets or web pages.",
    steps: ["Paste the text that needs cleanup.", "Select the cleanup operations that match the problem, such as trimming spaces or reducing repeated blank lines.", "Run the cleaner and compare the output to ensure meaningful spacing and line breaks remain."],
    example: "Clean copied spreadsheet text before pasting it into a document or content management system.",
    tip: "Keep a copy of the original when cleaning structured data. Tabs, indentation and blank lines may carry meaning in code or tables.",
    faqs: [{ question: "Will cleanup remove all line breaks?", answer: "Only choose an operation that changes line breaks when that is what you intend. Review the selected cleanup settings first." }, { question: "Can I clean code with this tool?", answer: "For source code, use a language-aware formatter. General whitespace cleanup can damage indentation-sensitive content." }]
  },
  "text-diff-checker": {
    overview: "A text diff checker compares two passages and highlights changes. It helps reviewers identify additions, removals and edits between drafts, configuration snippets or copied text.",
    steps: ["Place the earlier version in the first text field and the newer version in the second.", "Run the comparison and inspect the highlighted additions and removals.", "Review surrounding context before accepting a change, especially when punctuation or whitespace affects meaning."],
    example: "Compare two versions of a policy paragraph to see exactly which sentences changed.",
    tip: "Use consistent line breaks in both versions to make line-based comparisons easier to read.",
    faqs: [{ question: "Does a diff checker decide which version is correct?", answer: "No. It identifies textual differences; a person must decide whether each change is intentional and accurate." }, { question: "Why are many lines marked as changed?", answer: "Large formatting changes, line wrapping or whitespace differences can make otherwise similar passages appear different." }]
  },
  "text-sorter": {
    overview: "A text sorter rearranges line-based lists into a predictable order. Alphabetical or numeric sorting is useful for names, labels, identifiers and simple datasets.",
    steps: ["Paste one item per line so each entry can be sorted independently.", "The tool sorts lines in ascending order using case-insensitive, numeric-aware comparison.", "Inspect values such as numbers, punctuation and blank lines before using the sorted result."],
    example: "Sort a list of category names alphabetically to make a directory easier to scan.",
    tip: "Text sorting and natural numeric sorting are not always the same. Check how values such as 2, 10 and 100 are ordered.",
    faqs: [{ question: "Can I sort numbers?", answer: "Use a numeric sort option when available. Alphabetical sorting can place numbers in an order that differs from their numeric value." }, { question: "Will duplicate lines be removed?", answer: "Sorting changes order; duplicate removal is a separate operation." }]
  },
  "text-to-speech": {
    overview: "Text-to-speech uses voices available through the browser or operating system to read written content aloud. It can help with proofreading, listening to notes and checking how copy sounds when spoken.",
    steps: ["Enter or paste the text you want to hear.", "Choose an available voice and speaking rate if those controls are provided.", "Start playback and use the playback controls to pause or stop when needed."],
    example: "Listen to a draft announcement to catch awkward phrasing that may be less obvious when reading silently.",
    tip: "Available voices vary by browser, operating system and installed language packs. Test the selected voice before a long session.",
    faqs: [{ question: "Why is no voice available?", answer: "Your browser or operating system may not have a speech voice installed or may not expose the speech synthesis API." }, { question: "Is the audio a professional voice recording?", answer: "No. It uses browser-provided speech synthesis and voice quality varies by device." }]
  },
  "word-counter": {
    overview: "A word counter measures the length of written content. Word and character counts are useful for application forms, article briefs, social posts and assignments with strict limits.",
    steps: ["Paste or type the passage into the text area.", "Review the live or generated word, character, line and paragraph totals.", "Edit the passage to meet your target and check the counts again before submitting it."],
    example: "Check a short biography against a platform's character limit before adding it to a profile.",
    tip: "Different platforms may count spaces, emojis, links and line breaks differently. Use the destination platform's own counter for final compliance.",
    faqs: [{ question: "Are spaces included in the character count?", answer: "The workspace may show separate counts with and without spaces. Use the one that matches your requirement." }, { question: "Why does an emoji count differently?", answer: "Some emoji use multiple Unicode code points. A visible symbol is not always one underlying character." }]
  },
  "age-calculator": {
    overview: "An age calculator finds the elapsed time between a date of birth and a selected reference date. It is a convenient calendar calculation, but official age rules can vary by jurisdiction and context.",
    steps: ["Enter the date of birth using the date control.", "Set the reference date if the tool provides one, or use the current date.", "Calculate the result and verify both dates if the result is needed for an official form."],
    example: "Calculate the age someone will be on the date of an upcoming event rather than on today's date.",
    tip: "Check the date format carefully. Day and month order can differ between regions.",
    faqs: [{ question: "Does the result update for a future date?", answer: "Use the reference-date control when available to calculate age on a particular past or future date." }, { question: "Can this determine legal eligibility?", answer: "No. Legal age and eligibility rules can include jurisdiction-specific definitions. Confirm important decisions with the relevant authority." }]
  },
  "bmi-calculator": {
    overview: "Body mass index (BMI) is a screening measure calculated from weight and height. It is one indicator used in population health contexts, not a diagnosis or a complete assessment of an individual's health.",
    steps: ["Choose the measurement units supported by the calculator.", "Enter height and weight carefully, checking decimal points and units.", "Calculate BMI and interpret it cautiously alongside appropriate professional guidance."],
    example: "Convert measurements into the same unit system before comparing a BMI result with a reference chart.",
    tip: "BMI does not directly measure body fat or account for every factor such as muscle mass, age and individual health context.",
    faqs: [{ question: "Is BMI a medical diagnosis?", answer: "No. BMI is a screening measure and should not be used alone to diagnose a health condition." }, { question: "Can BMI categories apply to everyone?", answer: "Interpretation varies by age, pregnancy status, population and clinical context. Consult a qualified health professional for personal advice." }]
  },
  "percentage-calculator": {
    overview: "Percentage calculations express a value as a proportion of 100. They are commonly used to compare quantities, calculate discounts, measure changes and find a share of a total.",
    steps: ["Choose the calculation type that matches your question.", "Enter the required values and confirm which number is the base or starting value.", "Calculate the result and check that the units and direction of change make sense."],
    example: "To find 15% of a price, enter 15 as the percentage and the price as the base amount.",
    tip: "A percentage increase and a percentage-point difference are not interchangeable. Identify the base value before interpreting a change.",
    faqs: [{ question: "What happens when the base value is zero?", answer: "A percentage relative to a zero denominator is undefined. A reliable calculator should report that clearly rather than inventing a numeric result." }, { question: "How do I calculate percentage change?", answer: "Subtract the original value from the new value, divide by the original value, then multiply by 100. The original value must be non-zero." }]
  },
  "typing-speed-test": {
    overview: "A typing-speed test estimates how quickly and accurately you type a sample passage over a timed session. Repeating the same test conditions can help you track practice over time.",
    steps: ["Choose a test duration or passage if the workspace offers those options.", "Start the test and type the displayed text as accurately as possible.", "Review words per minute and accuracy, then repeat with a fresh passage to compare results."],
    example: "Take a one-minute practice test at the start and end of a week to see whether accuracy improves.",
    tip: "Prioritize accuracy before speed. Rushing can raise raw keystrokes while increasing corrections and errors.",
    faqs: [{ question: "What does WPM mean?", answer: "Words per minute is a standardized estimate of typing speed. Test tools may use different conventions for defining a word." }, { question: "Why do results vary between tests?", answer: "Passage difficulty, punctuation, unfamiliar words, keyboard layout and test duration all affect the result." }]
  },
  "password-generator": {
    overview: "A password generator creates random credentials for accounts and services. Longer, unique passwords reduce the risk that one exposed password can be reused to access another account.",
    steps: ["Choose a length and character options that meet the destination service's requirements.", "Generate a password and use the copy control to transfer it directly to a trusted password manager.", "Save it securely in your password manager and enable multi-factor authentication where available."],
    example: "Generate a unique password for a new account instead of adapting a password already used elsewhere.",
    tip: "Never reuse generated passwords across services, and do not share them in messages or screenshots.",
    faqs: [{ question: "Should I memorize every generated password?", answer: "A reputable password manager can store unique passwords securely so you do not need to reuse or memorize them." }, { question: "Does a longer password help?", answer: "Length is an important factor, especially when passwords are generated randomly. Follow the service's length and character rules." }]
  },
  "password-strength-checker": {
    overview: "A password-strength checker provides an estimate based on characteristics such as length and character variety. It is a local convenience check, not a guarantee that a password has never appeared in a breach or is safe against every attack.",
    steps: ["Enter a sample password only if you are comfortable checking it in the current browser session.", "Review the feedback about length and composition.", "Use the suggestions to create a new, unique password and store it in a password manager."],
    example: "Compare a newly created passphrase with a shorter, predictable example to understand why length and uniqueness matter.",
    tip: "For the safest workflow, do not paste an existing high-value account password into any online checker. Use the feedback to evaluate a newly generated sample instead.",
    faqs: [{ question: "Does a strong score prove a password is secure?", answer: "No. Strength estimates cannot account for every attack, reuse, phishing or service-side breach." }, { question: "Does the checker search leaked-password databases?", answer: "Do not assume it does. This tool provides a browser-side estimate and does not claim to verify breach history." }]
  },
  "base64-converter": {
    overview: "Base64 represents binary data using a text-safe alphabet. Developers commonly use it to move small data payloads through systems that expect text, but it is an encoding format rather than encryption.",
    steps: ["Choose whether you want to encode plain text or decode an existing Base64 value.", "Paste the input and run the selected operation.", "Check the output and remember that decoded content may contain data that should be handled carefully."],
    example: "Encode a short text value for a test fixture, then decode it to confirm that the original text is recovered.",
    tip: "Base64 does not hide secrets. Anyone with the encoded value can decode it without a key.",
    faqs: [{ question: "Is Base64 encryption?", answer: "No. It is reversible encoding and provides no confidentiality or authentication." }, { question: "Why can decoding fail?", answer: "The input may contain invalid characters, incorrect padding or data that is not valid for the expected text encoding." }]
  },
  "csv-to-json": {
    overview: "CSV stores tabular data as rows and columns in a text file. JSON represents structured data as arrays and objects, making it convenient for APIs and many application workflows.",
    steps: ["Paste CSV text with a clear header row when the first row contains column names.", "Run the conversion and inspect how commas, quotes and empty cells are interpreted.", "Copy or download the JSON and validate it in the system that will consume it."],
    example: "Convert a small spreadsheet export with columns such as name, category and status into an array of JSON objects.",
    tip: "CSV values can contain quoted commas and line breaks. Use properly quoted CSV input rather than manually removing punctuation.",
    faqs: [{ question: "Does CSV have data types?", answer: "CSV is plain text. A converter may preserve values as strings unless it explicitly supports type inference." }, { question: "What if a row has a different number of columns?", answer: "Inspect the conversion result and correct malformed rows in the source. Uneven rows can lead to missing or unexpected fields." }]
  },
  "html-encoder-decoder": {
    overview: "HTML entity encoding replaces special characters with safe textual representations for HTML contexts. Decoding reverses entities back into characters. Correct output encoding helps prevent markup from being interpreted as unintended HTML.",
    steps: ["Paste the text that needs encoding or the entity string that needs decoding.", "Choose the matching encode or decode operation.", "Review the result in plain text and use context-appropriate output encoding when building a website."],
    example: "Encode a literal less-than sign before displaying a code example in an HTML page.",
    tip: "HTML entity encoding is context-specific output handling, not a complete security sanitizer. Use a well-maintained sanitizer for untrusted rich HTML.",
    faqs: [{ question: "Does encoding make HTML safe in every context?", answer: "No. HTML text, attributes, URLs, CSS and JavaScript have different security contexts and require appropriate handling." }, { question: "Why does decoding reveal tags?", answer: "Decoding turns entities back into their original characters. Do not insert decoded untrusted text as live HTML." }]
  },
  "json-formatter": {
    overview: "JSON is a structured data format used by APIs, configuration files and applications. Formatting makes nested objects easier to read, while validation helps identify syntax errors before data is used.",
    steps: ["Paste the JSON source into the input area.", "Choose format or minify, then run the operation.", "If validation reports an error, inspect the indicated syntax and correct the source before using the output."],
    example: "Format a compact API response so nested properties and arrays are easier to inspect during debugging.",
    tip: "JSON requires double-quoted property names and strings, and it does not allow trailing commas or comments.",
    faqs: [{ question: "Does formatting change the data?", answer: "Formatting changes whitespace and indentation, not the represented JSON values." }, { question: "Why is my JavaScript object rejected?", answer: "JavaScript object literals can contain syntax that JSON does not allow, such as unquoted keys, functions or trailing commas." }]
  },
  "json-to-csv": {
    overview: "JSON-to-CSV conversion turns a collection of similarly shaped records into rows and columns. It is useful for moving structured data into spreadsheet applications for review and reporting.",
    steps: ["Paste a JSON array containing records with consistent fields.", "Run the conversion and inspect how nested values and missing properties are represented.", "Download or copy the CSV, then open it in a spreadsheet to verify columns and quoting."],
    example: "Convert an array of customer-free sample records with name, category and date fields into a spreadsheet-friendly table.",
    tip: "CSV is a flat table. Nested arrays and objects need a clear flattening strategy before they can be represented as columns.",
    faqs: [{ question: "Can any JSON document become a CSV table?", answer: "Not directly. CSV is tabular, so the input should generally be an array of records with compatible fields." }, { question: "Why do some cells contain quotes?", answer: "CSV uses quoting to preserve commas, quotation marks and line breaks inside cell values." }]
  },
  "keyword-density-checker": {
    overview: "Keyword density describes how often a term appears relative to the amount of text. A keyword checker can help editors spot repetition and understand the vocabulary used in a draft.",
    steps: ["Paste the passage you want to review.", "Enter a target term or run the available frequency analysis.", "Review counts in context and edit only where repetition makes the writing less natural or less clear."],
    example: "Check whether a product description repeats the same phrase too often compared with useful related terms.",
    tip: "Do not write to a target density percentage. Search systems reward helpful content, not mechanical repetition.",
    faqs: [{ question: "Is there an ideal keyword density?", answer: "No universal target guarantees rankings. Use terms naturally where they help readers understand the topic." }, { question: "Should every occurrence be removed?", answer: "No. Repetition can be appropriate when a term is necessary for clarity. Review context rather than optimizing a number alone." }]
  },
  "number-system-converter": {
    overview: "Number systems represent values using different bases. Binary uses base 2, octal base 8, decimal base 10 and hexadecimal base 16; developers use them when inspecting low-level data and digital representations.",
    steps: ["Select the source base that matches the number you entered.", "Enter a valid value using only digits allowed by that base.", "Convert and compare the result with the target representation you need."],
    example: "Convert the hexadecimal value 2A to decimal when reading a compact numeric identifier in a debugging task.",
    tip: "A digit that is valid in decimal may be invalid in binary or octal. Check the source base before interpreting an error.",
    faqs: [{ question: "Why is 102 invalid in binary?", answer: "Binary uses only the digits 0 and 1, so a value containing 2 is not valid base-2 input." }, { question: "Is hexadecimal case-sensitive?", answer: "Hexadecimal letters A through F are commonly accepted in either uppercase or lowercase." }]
  },
  "unix-timestamp-converter": {
    overview: "A Unix timestamp represents elapsed time from the Unix epoch, commonly expressed in seconds or milliseconds. Converting it to a calendar date helps developers inspect logs, API payloads and scheduled events.",
    steps: ["Enter the timestamp and confirm whether it is expressed in seconds or milliseconds.", "Convert it using the tool's date and time output.", "Check the timezone and compare the result with the source system's expected time."],
    example: "Convert a timestamp from an API response into a readable date to investigate when an event was recorded.",
    tip: "A value off by a factor of 1,000 often indicates seconds were interpreted as milliseconds or vice versa.",
    faqs: [{ question: "Why does the displayed time differ from a log?", answer: "One value may be UTC while another is shown in your local timezone. Compare timezone offsets as well as the date." }, { question: "What is the Unix epoch?", answer: "It is 1970-01-01 00:00:00 UTC, the reference point used by standard Unix time." }]
  },
  "url-encoder-decoder": {
    overview: "URL encoding represents characters that have special meaning or cannot be safely used directly in a URL component. It is commonly used when building query parameters and transmitting text through web addresses.",
    steps: ["Paste the text or encoded URL component into the input.", "Choose encode or decode based on the direction you need.", "Review reserved characters and place the result in the correct URL component."],
    example: "Encode a search phrase containing spaces and punctuation before placing it in a query parameter.",
    tip: "Encode a URL component, not necessarily the entire URL. Separators such as ?, &, and # have structural meaning in a complete address.",
    faqs: [{ question: "Is URL encoding encryption?", answer: "No. It changes how characters are represented and does not conceal the underlying information." }, { question: "Why do spaces appear as %20 or +?", answer: "Different URL and form-encoding conventions represent spaces differently. Use the format expected by the destination." }]
  },
  "uuid-generator": {
    overview: "A UUID is a standardized identifier designed to be unique across a large set of generated values. UUIDs are often used for database records, test data and distributed systems where a central counter is inconvenient.",
    steps: ["Choose the UUID format or quantity supported by the generator.", "Generate the identifier values.", "Copy or download the result and use it in the field that expects that UUID version."],
    example: "Generate a UUID for a local development fixture that needs a stable-looking record identifier.",
    tip: "A UUID is an identifier, not an access token or password. Do not rely on it alone to authorize access to private resources.",
    faqs: [{ question: "Can UUIDs ever collide?", answer: "Collision probability depends on the UUID version and generation method. They are designed to make collisions extremely unlikely, not mathematically impossible in every context." }, { question: "Should I use a UUID as a secret?", answer: "No. Use dedicated cryptographic tokens for authentication and authorization." }]
  },
  "xml-formatter": {
    overview: "XML represents structured information using nested elements and attributes. Formatting makes documents easier to inspect, while well-formedness checks help locate mismatched tags and other syntax problems.",
    steps: ["Paste the XML document into the input area.", "Run the formatter or validation action.", "Correct any reported tag or syntax issues and review the formatted hierarchy."],
    example: "Format a compact XML configuration document so parent and child elements are easier to inspect.",
    tip: "XML element names are case-sensitive. Opening and closing tags must match exactly and be properly nested.",
    faqs: [{ question: "Is well-formed XML always valid against a schema?", answer: "No. Well-formedness checks syntax; schema validity is a separate check against a DTD, XSD or other rules." }, { question: "Why is a self-closing tag accepted?", answer: "XML permits empty elements to use the self-closing form, such as an element written with />." }]
  },
  "text-binary-converter": {
    overview: "Binary text conversion represents characters using sequences of bits, commonly based on UTF-8 bytes. It is useful for learning how text encodings represent data and for inspecting simple binary examples.",
    steps: ["Choose text-to-binary or binary-to-text mode.", "Enter the text or a sequence of binary byte groups in the expected format.", "Convert and check that the output matches the original encoding assumptions."],
    example: "Convert a short ASCII word into binary groups to see the bit representation of each byte.",
    tip: "Not every character is one byte. Unicode text such as emoji can use multiple UTF-8 bytes.",
    faqs: [{ question: "Why does a non-English character produce more bits?", answer: "UTF-8 uses one to four bytes for a Unicode code point, depending on the character." }, { question: "Can I paste binary without spaces?", answer: "Use the grouping format expected by the tool. Byte boundaries are important when decoding binary text." }]
  },
  "color-picker": {
    overview: "A color picker helps you choose a color and inspect common representations such as HEX, RGB and HSL. These values can be reused in design systems, CSS and graphics applications.",
    steps: ["Choose a color using the picker or enter a supported color value.", "Review the corresponding HEX, RGB and HSL representations.", "Copy the value that matches the syntax expected by your design or code environment."],
    example: "Copy a HEX value from the picker and use it as a CSS background color for a button.",
    tip: "Check text and background contrast together. A visually attractive color pair may still be difficult for some people to read.",
    faqs: [{ question: "Are HEX and RGB different colors?", answer: "They are different notations for representing the same color channels when their values are equivalent." }, { question: "What is HSL useful for?", answer: "HSL separates hue, saturation and lightness, which can make it easier to create related shades." }]
  },
  "gradient-generator": {
    overview: "A CSS gradient blends colors across a direction or shape and can be used as a background without creating a separate image file. A generator helps tune color stops and preview the result.",
    steps: ["Choose the gradient type and direction offered by the controls.", "Add or adjust color stops and their positions.", "Preview the blend, then copy the generated CSS into your stylesheet."],
    example: "Create a subtle two-color linear gradient for a page header background.",
    tip: "Check the gradient behind real text and controls. Keep contrast sufficient across the entire area, not just at one color stop.",
    faqs: [{ question: "Does a CSS gradient need an image file?", answer: "No. CSS gradients are rendered by the browser as image values in stylesheets." }, { question: "Why does the gradient look different in another browser?", answer: "Color profiles, displays, color spaces and surrounding styles can affect the perceived result." }]
  },
  "bio-generator": {
    overview: "A social bio is a short introduction that tells visitors who an account is for and what they can expect. A generator can help brainstorm concise wording, but the final bio should reflect the real person, project or organization.",
    steps: ["Enter the topic, role or audience the bio should describe.", "Generate ideas and select wording that accurately represents the account.", "Edit for the platform's character limit, tone and any required links or disclosures."],
    example: "Draft a concise creator bio that states the content topic and gives visitors a clear reason to follow.",
    tip: "Avoid claims, credentials or promises that are not true. A specific and accurate bio is more useful than generic hype.",
    faqs: [{ question: "Will the same bio fit every platform?", answer: "No. Character limits, link support and audience expectations vary. Adapt the wording for each platform." }, { question: "Should I publish the first generated result?", answer: "Treat generated text as a draft. Check accuracy, voice and spelling before using it." }]
  },
  "caption-generator": {
    overview: "A social caption adds context and a call to action to a photo, video or post. Strong captions are relevant to the content and make the intended message easy to understand.",
    steps: ["Describe the post topic, audience and tone you want to use.", "Generate caption ideas and select one that accurately matches the media.", "Edit the wording, check names and claims, and add a clear call to action only when appropriate."],
    example: "Create a short caption for a tutorial clip that tells viewers what they will learn and invites a relevant question.",
    tip: "Do not use a caption that promises something the video does not deliver. Relevance and authenticity matter more than exaggerated engagement bait.",
    faqs: [{ question: "Should I use the same caption everywhere?", answer: "Adapt length, formatting and calls to action for each platform and audience." }, { question: "Can generated captions guarantee reach?", answer: "No. Captions can improve clarity, but distribution depends on many platform and audience factors." }]
  },
  "hashtag-generator": {
    overview: "Hashtags group social posts around topics and help people browse related content on platforms that support them. Relevant tags describe the actual post rather than attempting to attach it to unrelated trends.",
    steps: ["Enter the post topic or a few accurate keywords.", "Generate suggestions and remove tags that do not describe the content.", "Use a small, focused set that fits the platform's current guidance and your audience."],
    example: "For a short video about home gardening, choose tags related to gardening, plants and the specific subject shown.",
    tip: "A long block of unrelated or repetitive hashtags can make a post look spammy. Relevance is more important than quantity.",
    faqs: [{ question: "How many hashtags should I use?", answer: "There is no universal number for every platform. Follow current platform guidance and use only tags that genuinely fit the post." }, { question: "Do hashtags guarantee views?", answer: "No. Hashtags can help categorize content but cannot guarantee reach, engagement or ranking." }]
  },
  "qr-generator": {
    overview: "A QR code stores text or a link in a pattern that a compatible camera or scanner can read. It is commonly used to share website addresses, contact details and short pieces of information.",
    steps: ["Enter the exact URL or text you want the QR code to contain.", "Generate the code and scan it with a second device to test the destination.", "Download the image and place it where the code has enough size, contrast and quiet space to scan."],
    example: "Create a QR code for a public event page and test it on a phone before printing it on a poster.",
    tip: "Test the final printed or displayed code at its real size. A QR code that scans on a large monitor may fail when printed too small.",
    faqs: [{ question: "Does a QR code expire?", answer: "A static QR code does not normally expire, but the URL or service it points to can change or stop working." }, { question: "Should I put private information in a QR code?", answer: "Only encode information you are comfortable sharing with anyone who can scan it. A QR code is not access control." }]
  }
};
