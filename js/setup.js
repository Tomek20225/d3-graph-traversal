// Zmienne pomocnicze
const form = new Map([
  ["settings", document.querySelector("#settings")],
  ["graph", document.querySelectorAll(".btn-graph")],
  ["algorithm", document.querySelectorAll("input[name=algorithm]")],
  ["startNode", document.querySelector("#startNode")],
  ["endNode", document.querySelector("#endNode")],
  ["simulate", document.querySelector("#simulate")],
]);
const nodeStatus = {
  UNVISITED: "UNVISITED",
  VISITED: "VISITED",
};
const alertBox = document.querySelector("#alertBox");
const visualization = document.querySelector("#visualization");

// Określenie rozmiaru grafu i przetrzeni roboczej
const margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Utworzenie obiektu SVG zawierającego graf
let svg = d3
  .select("#visualization")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

// Utworzenie grafu
async function loadGraph(data) {
  // Inicjalizacja elementu-rodzica
  let parent = svg
    .append("g")
    .attr("id", "parentElement")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Zwizualizowanie połączeń pomiędzy węzłami
  let link = parent
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

  // Stworzenie grup dla par węzłów i ich podpisów
  let nodeGroup = parent
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("g");

  // Zwizualizowanie węzłów
  let node = nodeGroup
    .append("circle")
    .attr("r", 20)
    .attr("class", "node")
    .attr("id", (d) => `node-${d.id}`)
    .style("fill", "rgb(230,230,230)");

  // Zwizualizowanie podpisów węzłów
  let nodeText = nodeGroup.append("text").text((d) => d.id);

  // Inicjalizacja wszystkich elementów
  let simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .links(data.links)
    )
    .force("charge", d3.forceManyBody().strength(-400))
    .force("center", d3.forceCenter(width / 2, height / 2))
    // Funkcja wywolana wraz z wczytaniem się grafu
    .on("end", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x + 6).attr("cy", (d) => d.y - 6);

      nodeText.attr("x", (d) => d.x).attr("y", (d) => d.y);

      settings.style.display = "block";
      visualization.style.display = "block";
      alertBox.innerHTML = "";
    });
}

// Przetworzenie danych z pliku JSON w formacie zgodnym z biblioteką
// na potrzeby dalszego przetwarzania przez algorytm
function translateData(d) {
  for (let i = 0; i < d.nodes.length; i++) {
    const currentNode = d.nodes[i];
    currentNode.element = document.querySelector(`#node-${currentNode.id}`);
    currentNode.neighbours = [];
    currentNode.status = nodeStatus.UNVISITED;

    for (const link of d.links) {
      const source = link.source;
      const target = link.target;

      if (currentNode == source) currentNode.neighbours.push(target);
      if (currentNode == target) currentNode.neighbours.push(source);
    }
  }
  return d.nodes;
}

// Pobrany i aktualnie wykorzystywany zbiór danych
// Inicjalizowany podczas wczytywania grafu
let data;

// Nasłuch na zdarzenie wczytania nowego grafu
for (const btn of form.get("graph")) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    d3.select("#parentElement").remove();
    settings.style.display = "none";
    visualization.style.display = "none";
    alertBox.innerHTML = "Wczytywanie grafu...";
    data = [];

    d3.json(btn.getAttribute("data-url"), (d) => {
      loadGraph(d);
      data = translateData(d);
    });
  });
}

// Nasłuch na żądanie uruchomienia algorytmu
// zgodnie z wybranymi parametrami
form.get("simulate").addEventListener("click", (e) => {
  e.preventDefault();
  alertBox.innerHTML = "";

  for (const node of data) {
    node.element.style.fill = "rgb(230, 230, 230)";
    node.status = nodeStatus.UNVISITED;
  }

  let algo;
  for (const radio of form.get("algorithm")) {
    if (radio.checked) {
      algo = radio.value;
    }
  }

  const startId = form.get("startNode").value;
  const endId = form.get("endNode").value;

  if (startId == endId) {
    alert("Id pierwszego węzła nie może być równe Id docelowego węzła.");
    return;
  }

  switch (algo) {
    case "bfs":
      alertBox.innerHTML = `Najkrótsza ścieżka: ${bfs(data, startId, endId).join(
        " => "
      )}`;
      break;
    // case "dfs":
    //   dfs(data, startId, endId);
    //   break;
    default:
      break;
  }
});
