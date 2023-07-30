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

async function showContent(page) {
  await d3.selectAll(".description[data-page]").classed("active", false);
  await d3
    .select(".description[data-page='" + page + "']")
    .classed("active", true);
}

async function drawChart(page) {
  let data = await d3.csv("../data/homerun_by_team.csv");
  data = data.slice().sort((a, b) => d3.ascending(a.pitches, b.pitches));
  const svg = d3.select("svg");
  const width = CHART_DIMENSION.width / data.length;
  const height = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.pitches)])
    .range([0, CHART_DIMENSION.height]);
  const xAxis = d3
    .scaleBand()
    .domain(data.map((d) => d.team))
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

  const chartBars = svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("height", (d) => height(d.pitches))
    .attr("width", width - PADDING)
    .attr("x", (d) => xAxis(d.team))
    .attr("y", (d) => CHART_DIMENSION.height - height(d.pitches))
    .attr("fill", (d) => TEAM_COLORS[d.team])
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .on("mouseover", () => {
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", (event, d) => {
      tooltip
        .style("top", event.pageY - 88 + "px")
        .style("left", event.pageX + "px")
        .html(
          `<img src="../img/${d.team}.svg" /><p>Team: ${d.team}</p><p>Pitches: ${d.pitches}</p><p>In play: ${d.inplay}</p><p>Homerun: ${d.homerun}</p>`
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

  const chartYAxis = svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .call(d3.axisLeft(yAxis));

  d3.selectAll(".navigation button").on("click", function (event) {
    const page = event.target.dataset.page;

    if (page === "1") {
      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => height(d.pitches))
        .attr("y", (d) => CHART_DIMENSION.height - height(d.pitches));

      chartYAxis.transition().duration(1000).call(d3.axisLeft(yAxis));
    }

    if (page === "2") {
      const inplayHeight = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.inplay)])
        .range([0, CHART_DIMENSION.height]);
      const inplayYAxis = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.inplay)])
        .range([CHART_DIMENSION.height, 0]);

      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => inplayHeight(d.inplay))
        .attr("y", (d) => CHART_DIMENSION.height - inplayHeight(d.inplay));

      chartYAxis.transition().duration(1000).call(d3.axisLeft(inplayYAxis));
    }

    if (page === "3") {
      const homerunHeight = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.homerun)])
        .range([0, CHART_DIMENSION.height]);
      const homerunYAxis = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.homerun)])
        .range([CHART_DIMENSION.height, 0]);

      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => homerunHeight(d.homerun))
        .attr("y", (d) => CHART_DIMENSION.height - homerunHeight(d.homerun));

      chartYAxis.transition().duration(1000).call(d3.axisLeft(homerunYAxis));
    }

    showContent(page);
  });
}

async function main(page) {
  page = page || "1";

  await drawChart(page);
}

function handlePageClick(page) {
  main(page);
}

main("1");
