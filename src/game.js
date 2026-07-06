import { FIGURES, STARTER_TEAM } from "../data/figures.js";
import { GOALS, SPAWNS, neighbors, reachableCells } from "./board.js";
import { compareSegments, segmentText, spin } from "./battle.js";

let nextPieceId = 1;

function cloneFigure(figureId, owner) {
  return {
    instanceId: `${owner}-${nextPieceId++}`,
    owner,
    figureId,
    name: FIGURES[figureId].name,
    mp: FIGURES[figureId].mp,
    position: null,
    wait: 0
  };
}

function createPlayer(id) {
  return {
    id,
    bench: STARTER_TEAM.map((figureId) => cloneFigure(figureId, id)),
    pc: [],
    field: []
  };
}

export function createInitialState() {
  nextPieceId = 1;
  return {
    players: {
      p1: createPlayer("p1"),
      p2: createPlayer("p2")
    },
    turn: "p1",
    selected: null,
    reachable: [],
    attackable: [],
    winner: null,
    log: ["ゲーム開始。ベンチのフィギュアを選んでSPに出してください。"]
  };
}

export function opponentOf(playerId) {
  return playerId === "p1" ? "p2" : "p1";
}

export function allFieldPieces(state) {
  return [...state.players.p1.field, ...state.players.p2.field];
}

export function pieceAt(state, cellKey) {
  return allFieldPieces(state).find((piece) => piece.position === cellKey) ?? null;
}

export function occupiedKeys(state) {
  return new Set(allFieldPieces(state).map((piece) => piece.position));
}

export function findPiece(state, instanceId) {
  for (const player of Object.values(state.players)) {
    const piece = [...player.bench, ...player.pc, ...player.field].find((item) => item.instanceId === instanceId);
    if (piece) return piece;
  }
  return null;
}

function currentPlayer(state) {
  return state.players[state.turn];
}

function log(state, message) {
  state.log.unshift(message);
}

function clearSelection(state) {
  state.selected = null;
  state.reachable = [];
  state.attackable = [];
}

function endTurn(state) {
  clearSelection(state);
  state.turn = opponentOf(state.turn);

  for (const piece of currentPlayer(state).bench) {
    if (piece.wait > 0) piece.wait -= 1;
  }
}

export function selectBenchPiece(state, instanceId) {
  if (state.winner) return state;
  const player = currentPlayer(state);
  const piece = player.bench.find((item) => item.instanceId === instanceId);
  if (!piece || piece.wait > 0) return state;

  state.selected = { kind: "bench", instanceId };
  state.reachable = SPAWNS[state.turn].filter((spawn) => !pieceAt(state, spawn));
  state.attackable = [];
  log(state, `${piece.name} を選択。空いているSPを選んで出撃。`);
  return state;
}

export function selectFieldPiece(state, instanceId) {
  if (state.winner) return state;
  const piece = currentPlayer(state).field.find((item) => item.instanceId === instanceId);
  if (!piece) return state;

  const occupied = occupiedKeys(state);
  state.selected = { kind: "field", instanceId };
  state.reachable = reachableCells(piece.position, piece.mp, occupied);
  state.attackable = neighbors(piece.position)
    .map((cell) => pieceAt(state, cell))
    .filter((other) => other && other.owner !== piece.owner)
    .map((other) => other.position);
  log(state, `${piece.name} を選択。移動先か隣接する相手を選択。`);
  return state;
}

export function clickCell(state, cellKey) {
  if (state.winner) return state;
  const target = pieceAt(state, cellKey);

  if (target && target.owner === state.turn) {
    return selectFieldPiece(state, target.instanceId);
  }

  if (!state.selected) return state;

  if (state.selected.kind === "bench" && state.reachable.includes(cellKey)) {
    return deploySelected(state, cellKey);
  }

  if (state.selected.kind === "field" && state.reachable.includes(cellKey) && !target) {
    return moveSelected(state, cellKey);
  }

  if (state.selected.kind === "field" && state.attackable.includes(cellKey) && target) {
    return battleSelected(state, target.instanceId);
  }

  return state;
}

function deploySelected(state, cellKey) {
  const player = currentPlayer(state);
  const selected = player.bench.find((piece) => piece.instanceId === state.selected.instanceId);
  if (!selected) return state;

  player.bench = player.bench.filter((piece) => piece.instanceId !== selected.instanceId);
  selected.position = cellKey;
  player.field.push(selected);
  log(state, `${player.id.toUpperCase()} ${selected.name} を ${cellKey} に出撃。`);
  endTurn(state);
  return state;
}

function moveSelected(state, cellKey) {
  const piece = findPiece(state, state.selected.instanceId);
  if (!piece) return state;
  piece.position = cellKey;
  log(state, `${piece.owner.toUpperCase()} ${piece.name} が ${cellKey} に移動。`);

  if (cellKey === GOALS[piece.owner]) {
    state.winner = piece.owner;
    clearSelection(state);
    log(state, `${piece.owner.toUpperCase()} の ${piece.name} がゴール到達。${piece.owner.toUpperCase()} の勝利！`);
    return state;
  }

  endTurn(state);
  return state;
}

function removeFromField(state, piece) {
  const player = state.players[piece.owner];
  player.field = player.field.filter((item) => item.instanceId !== piece.instanceId);
  piece.position = null;
}

function sendToPc(state, piece) {
  const player = state.players[piece.owner];
  removeFromField(state, piece);

  if (player.pc.length >= 2) {
    const ejected = player.pc.shift();
    ejected.wait = 1;
    player.bench.push(ejected);
    log(state, `${piece.owner.toUpperCase()} のPCが満員。${ejected.name} がベンチへ戻るが1ターン待機。`);
  }

  player.pc.push(piece);
  log(state, `${piece.owner.toUpperCase()} ${piece.name} はPCへ。`);
}

function battleSelected(state, defenderId) {
  const attacker = findPiece(state, state.selected.instanceId);
  const defender = findPiece(state, defenderId);
  if (!attacker || !defender) return state;

  const attackerFigure = FIGURES[attacker.figureId];
  const defenderFigure = FIGURES[defender.figureId];
  const attackerSpin = spin(attackerFigure.wheel);
  const defenderSpin = spin(defenderFigure.wheel);
  const result = compareSegments(attackerSpin, defenderSpin);

  log(state, `${attacker.name}: ${segmentText(attackerSpin)} / ${defender.name}: ${segmentText(defenderSpin)}`);

  if (result === "draw") {
    log(state, "バトルは引き分け。どちらも残る。\n");
  } else if (result === "attacker") {
    log(state, `${attacker.name} の勝ち。${defender.name} をPCへ。`);
    sendToPc(state, defender);
  } else {
    log(state, `${defender.name} の勝ち。${attacker.name} をPCへ。`);
    sendToPc(state, attacker);
  }

  endTurn(state);
  return state;
}
