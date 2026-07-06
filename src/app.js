import { allCells, GOALS, SPAWNS } from "./board.js";
import {
  clickCell,
  createInitialState,
  findPiece,
  pieceAt,
  selectBenchPiece
} from "./game.js";

let state = createInitialState();

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const logEl = document.querySelector("#battle-log");
const resetButton = document.querySelector("#reset-button");

resetButton.addEventListener("click", () => {
  state = createInitialState();
  render();
});

function render() {
  renderStatus();
  renderBoard();
  renderBenches();
  renderPc();
  renderLog();
}

function renderStatus() {
  const selected = state.selected ? findPiece(state, state.selected.instanceId) : null;
  if (state.winner) {
    statusEl.textContent = `${state.winner.toUpperCase()} の勝利！リセットで再戦できます。`;
    return;
  }

  statusEl.textContent = selected
    ? `${state.turn.toUpperCase()} のターン / 選択中: ${selected.name}`
    : `${state.turn.toUpperCase()} のターン / ベンチか自分のフィギュアを選択`;
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (const cell of allCells()) {
    const cellEl = document.createElement("button");
    cellEl.className = "cell";
    cellEl.dataset.cell = cell.key;
    cellEl.disabled = !cell.playable;

    if (cell.playable) cellEl.classList.add("playable");
    if (cell.key === GOALS.p1) cellEl.classList.add("goal-p1");
    if (cell.key === GOALS.p2) cellEl.classList.add("goal-p2");
    if (SPAWNS.p1.includes(cell.key)) cellEl.classList.add("spawn-p1");
    if (SPAWNS.p2.includes(cell.key)) cellEl.classList.add("spawn-p2");
    if (state.reachable.includes(cell.key)) cellEl.classList.add("reachable");
    if (state.attackable.includes(cell.key)) cellEl.classList.add("attackable");

    const piece = pieceAt(state, cell.key);
    if (piece) {
      const pieceEl = document.createElement("div");
      pieceEl.className = `piece ${piece.owner}`;
      if (state.selected?.instanceId === piece.instanceId) pieceEl.classList.add("selected");
      pieceEl.textContent = piece.name;
      cellEl.append(pieceEl);
    } else if (cell.playable) {
      cellEl.textContent = cell.key;
    }

    cellEl.addEventListener("click", () => {
      state = clickCell(state, cell.key);
      render();
    });

    boardEl.append(cellEl);
  }
}

function renderBenches() {
  for (const playerId of ["p2", "p1"]) {
    const benchEl = document.querySelector(`#${playerId}-bench`);
    benchEl.innerHTML = "";
    for (const piece of state.players[playerId].bench) {
      const card = document.createElement("button");
      card.className = "figure-card";
      if (state.selected?.instanceId === piece.instanceId) card.classList.add("active");
      if (piece.wait > 0) card.classList.add("waiting");
      card.disabled = playerId !== state.turn || piece.wait > 0 || Boolean(state.winner);
      card.innerHTML = `<span>${piece.name}</span><small>MP ${piece.mp}${piece.wait > 0 ? " / wait" : ""}</small>`;
      card.addEventListener("click", () => {
        state = selectBenchPiece(state, piece.instanceId);
        render();
      });
      benchEl.append(card);
    }
  }
}

function renderPc() {
  for (const playerId of ["p2", "p1"]) {
    const pcEl = document.querySelector(`#${playerId}-pc`);
    pcEl.innerHTML = "";
    for (const piece of state.players[playerId].pc) {
      const card = document.createElement("div");
      card.className = "figure-card";
      card.innerHTML = `<span>${piece.name}</span><small>PC</small>`;
      pcEl.append(card);
    }
  }
}

function renderLog() {
  logEl.textContent = state.log.slice(0, 12).join("\n");
}

render();
