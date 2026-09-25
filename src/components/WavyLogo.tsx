const LOGO_WIDTH = 1276; // natural width of public/logo.png in px

// [x, width] of each letter in logo.png. Letters are joined, so cuts sit at the
// thinnest ink column between them ("What the hell is this?" = 18 letters).
const LETTERS: [number, number][] = [
  [1, 93], [94, 69], [163, 78], [241, 77],
  [348, 43], [391, 69], [460, 86],
  [585, 55], [640, 68], [708, 48], [756, 47],
  [841, 34], [875, 76],
  [982, 43], [1025, 69], [1094, 40], [1134, 76], [1210, 65],
];

// Shows the logo as one clipped slice per letter so each letter can bob on its own delay.
export function WavyLogo() {
  return (
    <span className="wavy-logo" role="img" aria-label="What the hell is this?">
      {LETTERS.map(([x, width], i) => (
        <span
          key={x}
          className="wavy-letter"
          style={{
            left: `${(x / LOGO_WIDTH) * 100}%`,
            width: `${(width / LOGO_WIDTH) * 100}%`,
            animationDelay: `${200 + i * 60}ms`,
          }}
        >
          <img
            src="/logo.png"
            alt=""
            style={{
              width: `${(LOGO_WIDTH / width) * 100}%`,
              marginLeft: `${(-x / width) * 100}%`,
            }}
          />
        </span>
      ))}
    </span>
  );
}
