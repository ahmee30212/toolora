export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: "ready" | "planned";
};

export const categories = [
  { slug: "image", name: "Image & Media", description: "Compress, resize, crop and convert images online with free browser-based tools. Prepare images for websites, documents and everyday sharing.", icon: "image" },
  { slug: "pdf", name: "PDF & Documents", description: "Merge, split, rotate and convert PDF files with free online document tools. Prepare pages and images in your browser.", icon: "file-text" },
  { slug: "text", name: "Text & Writing", description: "Clean, compare, format and analyze text with free browser-based writing tools for drafts, lists and everyday editing.", icon: "type" },
  { slug: "calculators", name: "Calculators", description: "Use free online calculators for age, BMI and percentage questions, with quick results and clear inputs.", icon: "calculator" },
  { slug: "speed", name: "Tests & Productivity", description: "Check typing speed and improve everyday productivity with simple browser-based tests and tools.", icon: "gauge" },
  { slug: "security", name: "Security", description: "Generate strong passwords and check password strength locally in your browser without sending your input to a server.", icon: "shield-check" },
  { slug: "developer", name: "Developer & Data", description: "Format JSON and XML, convert data, encode URLs and work with developer utilities directly in your browser.", icon: "code" },
  { slug: "design", name: "Color & Design", description: "Pick colors and build CSS gradients with simple design tools that help you prepare consistent visual styles.", icon: "palette" },
  { slug: "social", name: "Social Media", description: "Create profile bios, social captions and topic-based hashtags with free tools for planning social content.", icon: "at-sign" }
] as const;

export const tools: Tool[] = [
  { slug: "image-compressor", name: "Image Compressor", description: "Reduce image file size while preserving visual quality.", category: "image", icon: "images", status: "ready" },
  { slug: "image-converter", name: "Image Converter", description: "Convert images between popular file formats.", category: "image", icon: "refresh-cw", status: "ready" },
  { slug: "image-cropper", name: "Image Cropper", description: "Crop images to custom dimensions and aspect ratios.", category: "image", icon: "crop", status: "ready" },
  { slug: "image-resizer", name: "Image Resizer", description: "Resize images with precise width and height controls.", category: "image", icon: "maximize", status: "ready" },
  { slug: "images-to-pdf", name: "Images to PDF", description: "Combine multiple images into one PDF document.", category: "pdf", icon: "file-image", status: "ready" },
  { slug: "pdf-to-images", name: "PDF to Images", description: "Export PDF pages as image files.", category: "pdf", icon: "files", status: "ready" },
  { slug: "case-converter", name: "Case Converter", description: "Transform text into upper, lower, title and sentence case.", category: "text", icon: "case-sensitive", status: "ready" },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", description: "Generate clean placeholder copy for layouts and prototypes.", category: "text", icon: "text", status: "ready" },
  { slug: "markdown-editor", name: "Markdown Editor", description: "Write Markdown and preview formatted content.", category: "text", icon: "file-pen-line", status: "ready" },
  { slug: "remove-duplicate-lines", name: "Remove Duplicate Lines", description: "Find repeated lines and keep a clean unique list.", category: "text", icon: "list-filter", status: "ready" },
  { slug: "slug-generator", name: "Slug Generator", description: "Create readable, URL-friendly slugs from text.", category: "text", icon: "link", status: "ready" },
  { slug: "text-analyzer", name: "Text Analyzer", description: "Review word, character, sentence and reading statistics.", category: "text", icon: "chart-no-axes-combined", status: "ready" },
  { slug: "text-cleaner", name: "Text Cleaner", description: "Remove extra spaces and normalize text formatting.", category: "text", icon: "sparkles", status: "ready" },
  { slug: "text-diff-checker", name: "Text Diff Checker", description: "Compare two text passages and inspect their differences.", category: "text", icon: "git-compare", status: "ready" },
  { slug: "text-sorter", name: "Text Sorter", description: "Sort lines alphabetically or numerically.", category: "text", icon: "arrow-down-wide-narrow", status: "ready" },
  { slug: "text-to-speech", name: "Text to Speech", description: "Listen to written text with supported browser voices.", category: "text", icon: "volume-2", status: "ready" },
  { slug: "word-counter", name: "Word Counter", description: "Count words, characters, paragraphs and lines.", category: "text", icon: "align-left", status: "ready" },
  { slug: "age-calculator", name: "Age Calculator", description: "Calculate age from a date of birth.", category: "calculators", icon: "calendar-days", status: "ready" },
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Calculate body mass index from height and weight.", category: "calculators", icon: "activity", status: "ready" },
  { slug: "percentage-calculator", name: "Percentage Calculator", description: "Solve common percentage calculations quickly.", category: "calculators", icon: "percent", status: "ready" },
  { slug: "typing-speed-test", name: "Typing Speed Test", description: "Measure typing speed and accuracy with a timed test.", category: "speed", icon: "keyboard", status: "ready" },
  { slug: "password-generator", name: "Password Generator", description: "Generate strong random passwords in your browser.", category: "security", icon: "key-round", status: "ready" },
  { slug: "password-strength-checker", name: "Password Strength Checker", description: "Evaluate password characteristics locally in your browser.", category: "security", icon: "shield-check", status: "ready" },
  { slug: "base64-converter", name: "Base64 Converter", description: "Encode and decode Base64 text safely.", category: "developer", icon: "binary", status: "ready" },
  { slug: "csv-to-json", name: "CSV to JSON", description: "Convert comma-separated data into JSON.", category: "developer", icon: "table", status: "ready" },
  { slug: "html-encoder-decoder", name: "HTML Encoder / Decoder", description: "Encode or decode HTML entities.", category: "developer", icon: "code-xml", status: "ready" },
  { slug: "json-formatter", name: "JSON Formatter", description: "Format, minify and validate JSON data.", category: "developer", icon: "braces", status: "ready" },
  { slug: "json-to-csv", name: "JSON to CSV", description: "Convert JSON arrays into CSV files.", category: "developer", icon: "file-spreadsheet", status: "ready" },
  { slug: "keyword-density-checker", name: "Keyword Density Checker", description: "Analyze keyword frequency and density in text.", category: "developer", icon: "search", status: "ready" },
  { slug: "number-system-converter", name: "Number System Converter", description: "Convert values between binary, decimal, octal and hexadecimal.", category: "developer", icon: "binary", status: "ready" },
  { slug: "unix-timestamp-converter", name: "Unix Timestamp Converter", description: "Convert Unix timestamps to readable dates and back.", category: "developer", icon: "clock-3", status: "ready" },
  { slug: "url-encoder-decoder", name: "URL Encoder / Decoder", description: "Encode and decode URL components.", category: "developer", icon: "globe", status: "ready" },
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate standards-based UUID identifiers.", category: "developer", icon: "fingerprint", status: "ready" },
  { slug: "xml-formatter", name: "XML Formatter", description: "Format and validate XML documents.", category: "developer", icon: "file-code", status: "ready" },
  { slug: "text-binary-converter", name: "Text / Binary Converter", description: "Convert text to binary and binary back to text.", category: "developer", icon: "binary", status: "ready" },
  { slug: "color-picker", name: "Color Picker", description: "Choose colors and copy HEX, RGB and HSL values.", category: "design", icon: "pipette", status: "ready" },
  { slug: "gradient-generator", name: "Gradient Generator", description: "Create and customize CSS gradients.", category: "design", icon: "blend", status: "ready" },
  { slug: "bio-generator", name: "Bio Generator", description: "Draft profile bio ideas for social platforms.", category: "social", icon: "user-round", status: "ready" },
  { slug: "caption-generator", name: "Caption Generator", description: "Create caption ideas for social posts.", category: "social", icon: "message-square-text", status: "ready" },
  { slug: "hashtag-generator", name: "Hashtag Generator", description: "Generate relevant hashtag ideas from a topic.", category: "social", icon: "hash", status: "ready" },
  { slug: "qr-generator", name: "QR Code Generator", description: "Create QR codes from text, links and contact details.", category: "developer", icon: "qr-code", status: "ready" }
];

export const getTool = (slug: string) => tools.find((tool) => tool.slug === slug);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
export const getCategoryTools = (slug: string) => tools.filter((tool) => tool.category === slug);
