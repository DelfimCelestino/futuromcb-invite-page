export function TopLeftShape() {
  return (
    <div className="absolute -top-2 -left-2">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="20" cy="20" r="20" className="fill-green-500/30" />
        <circle cx="60" cy="20" r="15" className="fill-red-500/30" />
        <circle cx="20" cy="60" r="15" className="fill-yellow-500/30" />
      </svg>
    </div>
  );
}

export function BottomRightShape() {
  return (
    <div className="absolute -bottom-2 -right-2">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="100" cy="100" r="20" className="fill-green-500/30" />
        <circle cx="60" cy="100" r="15" className="fill-red-500/30" />
        <circle cx="100" cy="60" r="15" className="fill-yellow-500/30" />
      </svg>
    </div>
  );
}
