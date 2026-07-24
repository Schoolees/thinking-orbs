# @schoolees/thinking-orbs

A framework-free animated thinking-orb component for AI-driven interfaces.
It provides nine purpose-tuned canvas animations with no runtime
dependencies.

Adapted from
[Jakub Antalik's thinking-orbs](https://github.com/Jakubantalik/thinking-orbs)
under the MIT License.

## Features

- Nine states: `idle`, `working`, `connecting`, `searching`, `solving`,
  `listening`, `composing`, `responding`, and `shaping`
- Purpose-tuned `20px`, `64px`, `96px`, and `128px` sizes
- Automatic light/dark theme detection
- Live state, speed, theme, and pause controls
- Accessible state labels and reduced-motion support
- Automatic offscreen and background-tab pausing
- Plain Canvas 2D rendering; no React and no runtime dependencies
- Custom-element and imperative JavaScript APIs

## Develop and verify

```bash
git clone git@github.com:Schoolees/thinking-orbs.git
cd thinking-orbs
npm install
npm run check
npm run dev
```

## Install

Install directly from GitHub:

```bash
npm install git+ssh://git@github.com/Schoolees/thinking-orbs.git
```

For local development inside your local project:

```bash
npm install file:/path/to/workspace/components/thinking-orbs
```

Run `npm run build` in the component directory after changing its source.

## Custom element

Import the registration entry once in the consuming project's Vite entry:

```js
import '@schoolees/thinking-orbs/register';
```

Then use the element in Blade or ordinary HTML:

```html
<thinking-orb
    state="searching"
    size="64"
    theme="auto"
    speed="1"
    aria-label="Searching school records"
></thinking-orb>
```

Update it from plain JavaScript:

```js
const orb = document.querySelector('thinking-orb');

orb.state = 'composing';
orb.paused = false;

// The underlying controller is available after the element is connected.
orb.orb?.setSpeed(1.25);
```

Supported attributes:

| Attribute | Values | Default |
| --- | --- | --- |
| `state` | `idle`, `working`, `connecting`, `searching`, `solving`, `listening`, `composing`, `responding`, `shaping` | `working` |
| `size` | `20`, `64`, `96`, `128` | `64` |
| `theme` | `auto`, `light`, `dark` | `auto` |
| `speed` | Any positive number | `1` |
| `paused` | Boolean attribute | Off |
| `aria-label` | Custom accessible status | State-derived label |

## Imperative API

Use the controller when custom elements are not desirable:

```html
<div id="ai-status"></div>
```

```js
import { ThinkingOrb } from '@schoolees/thinking-orbs';

const orb = new ThinkingOrb('#ai-status', {
    state: 'working',
    size: 64,
    theme: 'auto',
    ariaLabel: 'Preparing your answer'
});

orb.setState('searching');
orb.setSpeed(1.2);
orb.pause();
orb.resume();

// Call when the host UI is removed.
orb.destroy();
```

You may pass a selector, container element, or existing canvas to the
constructor.

## Suggested AI-state mapping

| Application activity | Orb state |
| --- | --- |
| Ready for user input | `idle` |
| Waiting for general agent work | `working` |
| Establishing an AI or API connection | `connecting` |
| Retrieving records or web results | `searching` |
| Reasoning, validation, or calculation | `solving` |
| Capturing voice or user input | `listening` |
| Drafting a response | `composing` |
| Streaming or presenting a response | `responding` |
| Generating structured output | `shaping` |

## Theme detection

`theme="auto"` checks the nearest ancestor for:

- `data-theme="dark"` or `data-theme="light"`
- `data-coreui-theme="dark"` or `data-coreui-theme="light"`
- a `dark` or `light` class
- the operating-system color preference as a fallback

Theme changes are observed live. Use an explicit `light` or `dark` value when
the orb's immediate surface differs from the page theme.

## License

MIT. See [LICENSE](./LICENSE) and [NOTICE.md](./NOTICE.md).
