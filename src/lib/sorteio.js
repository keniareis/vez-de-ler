export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fair picker: cycles through a shuffled bag of names, reshuffling
// when exhausted, avoiding immediate repeats across a reshuffle,
// and able to skip names already used that day.
export function createPicker(names) {
  let queue = [];
  let last = null;
  function refill() {
    let arr = shuffle(names);
    if (last && arr.length > 1 && arr[0] === last) {
      const idx = 1 + Math.floor(Math.random() * (arr.length - 1));
      [arr[0], arr[idx]] = [arr[idx], arr[0]];
    }
    queue = arr;
  }
  function takeFirstAvailable(excludeSet) {
    for (let i = 0; i < queue.length; i++) {
      if (!excludeSet || !excludeSet.has(queue[i])) {
        return queue.splice(i, 1)[0];
      }
    }
    return null;
  }
  return function next(excludeSet) {
    if (queue.length === 0) refill();
    let val = takeFirstAvailable(excludeSet);
    if (val === null) {
      // Everything left in the current queue is excluded (can happen before
      // it's fully drained) — reshuffle the whole pool and try once more.
      refill();
      val = takeFirstAvailable(excludeSet);
    }
    if (val === null) {
      // The entire pool is excluded (e.g. a single-name list) — no valid
      // choice exists; return something rather than throw.
      val = queue.shift();
    }
    last = val;
    return val;
  };
}

export function montarCronograma({ datas, leitores, ministros, responsaveis, leitoresPorCel, ministrosPorCel }) {
  const pickLeitor = createPicker(leitores);
  const pickResponsavel = createPicker(responsaveis);
  const pickMinistro = createPicker(ministros);

  return datas.map((iso) => {
    const responsavel = pickResponsavel(null);

    const usadosLeitores = new Set([responsavel]);
    const numLeitores = Math.min(leitoresPorCel, leitores.length);
    const leitoresDoDia = [];
    for (let i = 0; i < numLeitores; i++) {
      const nome = pickLeitor(usadosLeitores);
      usadosLeitores.add(nome);
      leitoresDoDia.push(nome);
    }

    const usadosMinistros = new Set();
    const numMinistros = Math.min(ministrosPorCel, ministros.length);
    const ministrosDoDia = [];
    for (let i = 0; i < numMinistros; i++) {
      const nome = pickMinistro(usadosMinistros);
      usadosMinistros.add(nome);
      ministrosDoDia.push(nome);
    }

    return { data: iso, leitores: leitoresDoDia, responsavel, ministros: ministrosDoDia };
  });
}
