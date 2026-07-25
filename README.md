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
- Motion-matched `classic` dot and `contour` line variants for every state
- Purpose-tuned `32px`, `64px`, `96px`, and `128px` sizes
- Automatic light/dark theme detection
- Live state, speed, theme, and pause controls
- Optional pointer-driven distortion with smooth spring-back
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

`npm run dev` starts the interactive demo and prints its local URL. Hover or
drag across any orb in the demo to test pointer distortion. The page includes
all nine states, both visual variants, and all four supported sizes.

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
  interactive
  aria-label="Searching school records"
></thinking-orb>
```

The original animations are the default. Every state also provides an
optional motion-matched contour treatment:

```html
<thinking-orb
  state="working"
  variant="contour"
  size="128"
></thinking-orb>
```

Update it from plain JavaScript:

```js
const orb = document.querySelector('thinking-orb');

orb.state = 'composing';
orb.paused = false;
orb.interactive = true;

// The underlying controller is available after the element is connected.
orb.orb?.setSpeed(1.25);
```

Supported attributes:

| Attribute | Values | Default |
| --- | --- | --- |
| `state` | `idle`, `working`, `connecting`, `searching`, `solving`, `listening`, `composing`, `responding`, `shaping` | `working` |
| `size` | `32`, `64`, `96`, `128` | `64` |
| `theme` | `auto`, `light`, `dark` | `auto` |
| `variant` | `classic`, `contour` | `classic` |
| `speed` | Any positive number | `1` |
| `paused` | Boolean attribute | Off |
| `interactive` | Boolean attribute | Off |
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
    interactive: true,
    ariaLabel: 'Preparing your answer'
});

orb.setState('listening');
orb.setVariant('contour');
orb.setSpeed(1.2);
orb.setInteractive(true);
orb.pause();
orb.resume();

// Call when the host UI is removed.
orb.destroy();
```

You may pass a selector, container element, or existing canvas to the
constructor.

Controller methods:

| Method | Purpose |
| --- | --- |
| `setState(state)` | Change the active AI state |
| `setVariant(variant)` | Switch between `classic` and `contour` |
| `setTheme(theme)` | Set `auto`, `light`, or `dark` |
| `setSpeed(multiplier)` | Set a positive animation-speed multiplier |
| `setInteractive(enabled)` | Enable or disable pointer distortion |
| `pause()` / `resume()` | Control the base animation |
| `render(time?)` | Render immediately, optionally at a fixed time |
| `update(options)` | Apply multiple options together |
| `destroy()` | Remove observers, events, animation work, and owned canvas |

The read-only `snapshot` property reports the resolved state, size, theme,
variant, speed, pause and interaction settings, dark-mode result,
reduced-motion result, and visibility.

## Pointer interaction

Add the Boolean `interactive` attribute or pass `interactive: true` to enable
a localized spring distortion:

```html
<thinking-orb
  state="responding"
  variant="contour"
  size="128"
  interactive
></thinking-orb>
```

- Mouse hover distorts the geometry around the pointer.
- Touch and pen input work while dragging across the canvas.
- Classic dots and contour lines use the same interaction field.
- The orb smoothly returns to its resting shape after pointer leave or release.
- A paused orb can still respond without advancing its base animation.
- Interaction is disabled automatically for `prefers-reduced-motion: reduce`.
- The feature is opt-in and has no effect when `interactive` is absent.

## Rendering and lifecycle

- Canvas backing stores follow device pixel ratio, capped at `2×`.
- Offscreen or background-tab animations pause automatically.
- Theme changes on relevant ancestors are observed live.
- Call `destroy()` for imperative instances when their host UI is removed.
- Custom elements clean themselves up when disconnected.

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
