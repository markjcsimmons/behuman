# BeHuman - Verify You Are Human

A simple, standardized verification widget that can be easily added to any website.

## Quick Start

**One-Step Installation:** Just add this single line to your HTML:

```html
<script src="https://markjcsimmons.github.io/behuman/widget.js"></script>
```

That's it! A "Verify You Are Human" button will automatically appear in the bottom-right corner of your page.

### Optional: Custom Trigger

If you want to trigger it manually instead of using the auto-created button:

```html
<button onclick="BeHuman.show()">Verify You Are Human</button>
```

## Usage

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome</h1>
    <button onclick="BeHuman.show()">Verify You Are Human</button>
    
    <script src="https://markjcsimmons.github.io/behuman/widget.js"></script>
</body>
</html>
```

### Programmatic Usage

You can also trigger the verification programmatically:

```javascript
// Show the verification modal
BeHuman.show();

// Hide the verification modal (if needed)
BeHuman.hide();
```

## Features

- ✅ Simple one-line installation
- ✅ Works on any website
- ✅ Mobile-responsive design
- ✅ Touch-optimized for mobile devices
- ✅ No dependencies required
- ✅ Standardized verification process
- ✅ Share functionality included

## How It Works

1. User clicks a button or link that calls `BeHuman.show()`
2. A modal overlay appears with the verification interface
3. User completes the verification by checking all statements
4. Results are displayed (Verified Human or Try Again)
5. Verified users can share their verification

## Files

- `widget.js` - The embeddable widget (use this for integration)
- `index.html` - Standalone version (for full control)
- `badge.png` / `badge.svg` - Social sharing badge graphics
- `example.html` - Example implementation

## Browser Support

Works on all modern browsers:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Supports Web Share API where available

## License

Free to use on any website.
