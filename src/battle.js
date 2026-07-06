function totalSize(wheel) {
  return wheel.reduce((sum, segment) => sum + segment.size, 0);
}

export function spin(wheel) {
  const total = totalSize(wheel);
  let roll = Math.random() * total;
  for (const segment of wheel) {
    roll -= segment.size;
    if (roll <= 0) return segment;
  }
  return wheel[wheel.length - 1];
}

function score(segment) {
  if (segment.type === "miss") return { family: "miss", value: -1 };
  if (segment.type === "blue") return { family: "blue", value: 0 };
  if (segment.type === "purple") return { family: "purple", value: segment.stars ?? 1 };
  if (segment.type === "gold") return { family: "gold", value: segment.damage ?? 0 };
  return { family: "white", value: segment.damage ?? 0 };
}

export function compareSegments(attackerSegment, defenderSegment) {
  const a = score(attackerSegment);
  const d = score(defenderSegment);

  if (a.family === "miss" && d.family === "miss") return "draw";
  if (a.family === "miss") return "defender";
  if (d.family === "miss") return "attacker";

  if (a.family === "blue" && d.family === "blue") return "draw";
  if (a.family === "blue") return d.family === "gold" ? "defender" : "draw";
  if (d.family === "blue") return a.family === "gold" ? "attacker" : "draw";

  if (a.family === "purple" || d.family === "purple") {
    if (a.family === "gold") return "attacker";
    if (d.family === "gold") return "defender";
    if (a.family === "purple" && d.family === "purple") {
      if (a.value === d.value) return "draw";
      return a.value > d.value ? "attacker" : "defender";
    }
    if (a.family === "purple") return "attacker";
    if (d.family === "purple") return "defender";
  }

  if (a.value === d.value) return "draw";
  return a.value > d.value ? "attacker" : "defender";
}

export function segmentText(segment) {
  if (segment.type === "miss") return `${segment.label}`;
  if (segment.type === "blue") return `${segment.label} [Blue]`;
  if (segment.type === "purple") return `${segment.label} [Purple ★${segment.stars ?? 1}]`;
  return `${segment.label} [${segment.type} ${segment.damage ?? 0}]`;
}
