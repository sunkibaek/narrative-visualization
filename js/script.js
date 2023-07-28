const TEAM_COLORS = {
  ATL: "#ce1141",
  AZ: "#a71930",
  BAL: "#df4601",
  BOS: "#bd3039",
  CHC: "#0e3386",
  CIN: "#c6011f",
  CLE: "#e31937",
  COL: "#33006f",
  CWS: "#000000",
  DET: "#182d55",
  HOU: "#002d62",
  KC: "#174885",
  LAA: "#ba0021",
  LAD: "#005a9c",
  MIA: "#ff6600",
  MIL: "#0a2351",
  MIN: "#002b5c",
  NYM: "#ff5910",
  NYY: "#132448",
  OAK: "#003831",
  PHI: "#e81828",
  PIT: "#fdb827",
  SD: "#002d62",
  SEA: "#005c5c",
  SF: "#fd5a1e",
  STL: "#c41e3a",
  TB: "#8fbce6",
  TEX: "#003278",
  TOR: "#134a8e",
  WSH: "#ab0003",
};

const AREA_DIMENSION = {
  width: 700,
  height: 400,
};

const PADDING = 5;
const MARGIN = 50;

const CHART_DIMENSION = {
  width: AREA_DIMENSION.width - MARGIN * 2,
  height: AREA_DIMENSION.height - MARGIN * 2,
};

async function main() {
  const data = await d3.csv("../data/pitches_by_team.csv");
  const svg = d3.select("svg");
  const width = CHART_DIMENSION.width / data.length;
  const height = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.pitches)])
    .range([0, CHART_DIMENSION.height]);
  const xAxis = d3
    .scaleBand()
    .domain(data.map((d) => d.player_name))
    .range([0, CHART_DIMENSION.width])
    .padding(0.25);
  const yAxis = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.pitches)])
    .range([CHART_DIMENSION.height, 0]);
  const tooltip = d3
    .select(".tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");

  svg
    .append("g")
    .append("rect")
    .attr("fill", "#f0f4f5")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .attr("width", CHART_DIMENSION.width)
    .attr("height", CHART_DIMENSION.height);

  svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("height", (d) => height(d.pitches))
    .attr("width", width - PADDING)
    .attr("x", (d) => xAxis(d.player_name))
    .attr("y", (d) => CHART_DIMENSION.height - height(d.pitches))
    .attr("fill", (d) => TEAM_COLORS[d.player_name])
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .on("mouseover", () => {
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", (event, d) => {
      tooltip
        .style("top", event.pageY - 74 + "px")
        .style("left", event.pageX + "px")
        .html(
          `<img src="../img/${d.player_name}.svg" /><p>Team: ${d.player_name}</p><p>Pitches: ${d.pitches}</p><p>Velocity: ${d.velocity}</p>`
        );
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  svg
    .append("g")
    .attr(
      "transform",
      `translate(${MARGIN},${CHART_DIMENSION.height + MARGIN})`
    )
    .call(d3.axisBottom(xAxis));

  svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .call(d3.axisLeft(yAxis));
}

main();
