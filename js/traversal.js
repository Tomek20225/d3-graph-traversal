// Obsługa algorytmu BFS
// na wskazanych węzłach i określonym id węzła początkowego i końcowego
// Zwraca tablicę z id węzłów składających się na najkrótszą ścieżkę między dwoma węzłami
function bfs(nodes, startId, endId) {
  startId = Number(startId);
  endId = Number(endId);

  const startNode = nodes.find((node) => node.id == startId);
  if (!startNode) {
    alert("Węzeł startowy został niepoprawnie wprowadzony.");
    return;
  }

  let path = new Map(),
    finalPath = [];
  let queue = [];

  queue.push(startNode);
  path.set(startNode.id, -1);
  visitNode(startNode);

  let endNode = null;
  while (queue.length > 0) {
    const currentNode = queue[0];
    alert(
      `${printState(
        queue,
        path
      )}\n\nPobranie węzła z kolejki. Rozpoczynanie sprawdzania węzła ${
        currentNode.id
      }.`
    );

    if (currentNode.id == endId) {
      alert(`Odnaleziono węzeł docelowy ${currentNode.id}.`);
      endNode = currentNode;
      break;
    }

    alert(
      `Sprawdzenie sąsiadów węzła ${currentNode.id}. Węzeł ${
        currentNode.id
      } sąsiaduje z węzłami ${currentNode.neighbours
        .map((n) => n.id)
        .join(", ")}.\n`
    );
    for (const neighbour of currentNode.neighbours) {
      if (neighbour.status !== nodeStatus.VISITED) {
        path.set(neighbour.id, currentNode.id);
        queue.push(neighbour);

        if (
          confirm(
            `Odwiedzanie węzła ${
              neighbour.id
            }. Węzeł dodano do ścieżki oraz do kolejki.\n\n${printState(
              queue,
              path
            )}\n\nNaciśnij OK aby przejść do następnego kroku.`
          )
        ) {
          visitNode(neighbour);
        } else {
          alert("Przerwano działanie algorytmu.");
          return;
        }
      } else {
        alert(
          `Pominięto sprawdzanie węzła ${neighbour.id}, ponieważ został już odwiedzony.`
        );
      }
    }

    queue.shift();
  }

  if (!endNode) {
    alert(
      "Graf został przemierzony. Nie odnaleziono ścieżki między wskazanymi węzłami."
    );
  } else {
    visitNode(endNode);

    finalPath = getPath(path, endId);
    colorPath(finalPath);

    alert(
      `Graf został przemierzony. Najkrótsza ścieżka od węzła ${startId} do węzła ${endId} to: ${finalPath.join(
        " => "
      )}`
    );
  }

  return finalPath;
}

// Oznaczenie węzła jako odwiedzony
function visitNode(node) {
  node.status = nodeStatus.VISITED;
  colorNode(node.element, "rgb(180, 180, 180)");
}

// Zakolorowanie elementu DOM reprezentującego węzeł
function colorNode(nodeEl, fill) {
  nodeEl.style.fill = fill;
}

// Wygenerowanie tablicy przejść, złożonej z id węzłów pomiędzy węzłem startowym a końcowym włącznie
// na podstawie tablicy ścieżki generowanej podzczas przebiegu algorytmu
function getPath(traverseHistory, endId) {
  let path = [];
  path.push(endId);

  let nextHop = traverseHistory.get(endId);

  while (nextHop !== -1) {
    path.push(nextHop);
    nextHop = traverseHistory.get(nextHop);
  }

  return path.reverse();
}

// Zakolorowanie węzłów celem reprezentacji wskanej ścieżki wg. tablicy id węzłów
function colorPath(path) {
  for (let i = 0; i < path.length; i++) {
    const node = document.getElementById(`node-${path[i]}`);

    switch (i) {
      case 0:
        colorNode(node, "rgb(50,205,50)");
        break;
      case path.length - 1:
        colorNode(node, "rgb(220,20,60)");
        break;
      default:
        colorNode(node, "rgb(30,144,255)");
        break;
    }
  }
}

// Wyprowadzenie aktualnego stanu kolejki oraz ścieżki
// wykorzystywane pomocniczo podczas przebiegu algorytmu
function printState(queue, path) {
  return `Aktualny stan kolejki: ${queue
    .map((n) => n.id)
    .join(", ")}.\nAktualny stan ścieżki: ${Array.from(path)
    .map(([key, value]) => `${value} => ${key}`)
    .join(", ")}.`;
}
