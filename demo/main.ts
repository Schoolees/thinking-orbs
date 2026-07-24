import '../src/register';
import { ORB_STATES, type OrbState, type ThinkingOrbElement } from '../src';

const STATE_LABELS: Record<OrbState, string> = {
  idle: 'Idle',
  working: 'Working',
  connecting: 'Connecting',
  searching: 'Searching',
  solving: 'Solving',
  listening: 'Listening',
  composing: 'Composing',
  responding: 'Responding',
  shaping: 'Shaping'
};

const featuredOrb = document.querySelector<ThinkingOrbElement>('#featured-orb');
const featuredLabel = document.querySelector<HTMLElement>('#featured-label');
const stateControls = document.querySelector<HTMLElement>('#state-controls');
const stateGrid = document.querySelector<HTMLElement>('#state-grid');
const speed = document.querySelector<HTMLInputElement>('#speed');
const speedOutput = document.querySelector<HTMLOutputElement>('#speed-output');
const pauseToggle = document.querySelector<HTMLButtonElement>('#pause-toggle');
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle');

if (
  !featuredOrb
  || !featuredLabel
  || !stateControls
  || !stateGrid
  || !speed
  || !speedOutput
  || !pauseToggle
  || !themeToggle
) {
  throw new Error('Thinking-orbs demo could not find its required elements.');
}

let activeState: OrbState = 'responding';

for (const state of ORB_STATES) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = STATE_LABELS[state];
  button.dataset.state = state;
  button.className = state === activeState ? 'active' : '';
  button.addEventListener('click', () => {
    activeState = state;
    featuredOrb.state = state;
    featuredLabel.textContent = `${STATE_LABELS[state]}…`;
    featuredLabel.dataset.text = featuredLabel.textContent;

    for (const stateButton of stateControls.querySelectorAll('button')) {
      stateButton.classList.toggle(
        'active',
        stateButton.getAttribute('data-state') === state
      );
    }
  });
  stateControls.append(button);

  const card = document.createElement('article');
  card.className = 'state-card';
  card.innerHTML = `
    <div class="orb-sizes">
      <div>
        <thinking-orb state="${state}" size="128"></thinking-orb>
        <small>128px</small>
      </div>
      <div>
        <thinking-orb state="${state}" size="96"></thinking-orb>
        <small>96px</small>
      </div>
      <div>
        <thinking-orb state="${state}" size="64"></thinking-orb>
        <small>64px</small>
      </div>
      <div>
        <thinking-orb state="${state}" size="20"></thinking-orb>
        <small>20px</small>
      </div>
    </div>
    <div>
      <h3
        class="state-label is-shimmering"
        data-text="${STATE_LABELS[state]}"
      >${STATE_LABELS[state]}</h3>
      <code>state="${state}"</code>
    </div>
  `;
  stateGrid.append(card);
}

speed.addEventListener('input', () => {
  const value = Number(speed.value);
  featuredOrb.orb?.setSpeed(value);
  speedOutput.value = `${value.toFixed(2)}×`;
});

pauseToggle.addEventListener('click', () => {
  featuredOrb.paused = !featuredOrb.paused;
  pauseToggle.textContent = featuredOrb.paused
    ? 'Resume animation'
    : 'Pause animation';
});

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  themeToggle.textContent = nextTheme === 'dark'
    ? 'Switch to light'
    : 'Switch to dark';
});
