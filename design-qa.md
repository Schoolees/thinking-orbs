# Design QA

- Source visual truth:
  `line-round-spiral-wave-shapes-concentric-swirls-vector.jpg` supplied by the
  user
- Implementation: `demo/index.html`
- Intended desktop viewport: 1440 x 1000 CSS pixels at 1x density
- Intended mobile viewport: 390 x 844 CSS pixels at 1x density
- State: nine original animation states plus motion-matched contour variants,
  light and dark themes, and all four sizes
- Source screenshot: unavailable
- Implementation screenshot: unavailable

## Full-view comparison evidence

The original nine animation painters remain the default. Nine additive
alternatives adapt the supplied visual's thin monochrome strokes, circular
outer envelopes, layered contours, convergence points, and organic deformation
while retaining each original state's geometry and motion.

The classic working painter now also uses composing's coordinated strand
language as an internal reference. Its two intersecting, counter-rotating
ribbons and traveling particles preserve a more active working signal while
remaining visually related to composing's calmer single sash. Working now
shares composing's depth-scaled dot radii, contrast, and opacity, with reduced
sampling along each ribbon so its crossing bands retain visible spacing. The
faster traveling markers use five dots per band with larger radii and stronger
contrast, keeping ten active dots distinct from the background strands.
The working contour alternative uses the same two band planes, counter-motion,
lane spacing, deformation waves, global rotation, and spherical projection as
the classic working orb, replacing background dotted sampling with continuous
strokes. Its ten fast-moving markers sit on the matching line paths. The fixed
outer ring is omitted so the moving woven bands define the silhouette instead
of appearing as a stale, disconnected boundary. The markers use the classic
working dots' exact five-per-band count, depth-scaled radius, contrast, and
size tuning. A faint rotating cage of latitude and longitude contours now
preserves spherical depth at 32px and 64px, where the bands alone previously
collapsed into an hourglass. The slow contour field resolves the classic
working preset's exact `orbitN`, band count, lane distribution, spacing, and
motion at every size; only its continuous-stroke rendering differs.

The listening contour perimeter uses the classic listening orb's exact
ring-indexed radius equation: the same preset-scaled ring count, `2.1` and
`1.27` wave frequencies, `0.52` and `0.83` per-ring phase offsets, and
`0.88 + 0.105w` radial deformation. Every contour line now connects one
resolved ring of original listening dots using the same latitude, 3D
coordinates, `0.18t` spin, and `0.38` tilt.

The classic responding painter extends the same family with staggered,
expanding ribbon wavefronts. Its enlarged, tightly sampled, higher-contrast
dots use one uniform radius across closer parallel lanes and a persistent
spherical body that holds a circular silhouette at every frame. A traveling
brightness-and-opacity crest moves across each front to create a visible
shimmer without changing dot size or the monochrome theme contract.
Wavefront radius, opacity, and depth use continuous periodic motion, avoiding
the visible reset that a wrapped linear phase produced.

The classic connecting painter uses a persistent spherical body, two
counter-rotating ring nodes, three dotted bridge strands, and a seamless
traveling signal. This replaces the previous overlapping spherical lobes with
a clearer, organized connection state. Larger shared radii, higher minimum
node and bridge sampling, and a denser, more opaque spherical body improve its
visibility at inline and avatar sizes. A dedicated high-contrast dotted
perimeter keeps the outer circular silhouette stronger than the moving
interior details throughout the animation.

## Focused region evidence

Automated checks confirm that every default state still renders through the
classic registry, all nine contour variants render line paths, all four
supported sizes configure the correct canvas dimensions, and theme, state, and
variant changes update without replacing the canvas.
Visual pixel comparison could not be completed because an approved browser
surface is unavailable in this environment.

## Findings

- No code-level P0, P1, or P2 issues remain.
- Visual fidelity remains unverified because source and implementation
  browser screenshots could not be captured in the same browser workflow.

## Required fidelity surfaces

- Fonts and typography: the demo uses a system sans-serif stack and does not
  affect the reusable component.
- Spacing and layout rhythm: the component owns only its fixed 32px, 64px,
  96px, or 128px canvas; host projects own surrounding layout.
- Colors and visual tokens: the monochrome light/dark treatment is preserved,
  including automatic ancestor and OS theme detection.
- Image quality and asset fidelity: the component uses native Canvas 2D
  antialiased paths so the supplied line-art reference remains crisp at each
  supported size.
- Copy and content: original state names and accessible labels are preserved.

## Verification

- TypeScript type-check: passed.
- Vitest: 11 tests passed.
- Production package build: passed.
- Demo build: passed.
- Package dry run: passed with zero runtime dependencies.
- Browser interactions and console inspection: blocked because no approved
  browser surface is available.

## Final result

Final result: blocked.

Automated package verification passed. Rendered visual comparison remains
blocked because no approved browser surface is available in this environment.
