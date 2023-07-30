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

const BASE_URL = "https://sunkibaek.github.io/narrative-visualization";

async function showContent(page) {
  await d3.selectAll(".description[data-page]").classed("active", false);
  await d3
    .select(".description[data-page='" + page + "']")
    .classed("active", true);
}

async function drawTeamChart(page) {
  let data = await d3.csv(BASE_URL + "/homerun_by_team.csv");
  data = data.slice().sort((a, b) => d3.ascending(a.pitches, b.pitches));
  const allHomerunsData = await d3.csv(BASE_URL + "/all_homeruns.csv", (d) => ({
    distance_ft: +d.distance_ft,
    launch_angle: +d.launch_angle,
    ev_mph: +d.ev_mph,
    pitch_mph: +d.pitch_mph,
    player: d.player,
  }));
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
          `<img src="${BASE_URL}/img/${d.team}.svg" /><p>Team: ${d.team}</p><p>Pitches: ${d.pitches}</p><p>In play: ${d.inplay}</p><p>Homerun: ${d.homerun}</p>`
        );
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  const chartXAxis = svg
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

  const chartCircles = svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .selectAll("circle")
    .data(allHomerunsData)
    .enter()
    .append("circle")
    .style("fill", "rgba(0, 0, 0, 0.5)")
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
          `<p>Player: ${d.player}</p><p>Pitch (mph): ${d.pitch_mph}</p><p>Exit velocity (mph): ${d.ev_mph}</p><p>Launch angle (degree): ${d.launch_angle}</p><p>Distance (ft): ${d.distance_ft}</p>`
        );
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  d3.selectAll(".navigation button").on("click", async function (event) {
    const page = event.target.dataset.page;

    if (page === "1") {
      chartCircles.transition().duration(1000).attr("r", 0);

      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => height(d.pitches))
        .attr("y", (d) => CHART_DIMENSION.height - height(d.pitches));

      chartXAxis.transition().duration(1000).call(d3.axisBottom(xAxis));
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

      chartCircles.transition().duration(1000).attr("r", 0);

      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => inplayHeight(d.inplay))
        .attr("y", (d) => CHART_DIMENSION.height - inplayHeight(d.inplay));

      chartXAxis.transition().duration(1000).call(d3.axisBottom(xAxis));
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

      chartCircles.transition().duration(1000).attr("r", 0);

      chartBars
        .transition()
        .duration(1000)
        .attr("height", (d) => homerunHeight(d.homerun))
        .attr("y", (d) => CHART_DIMENSION.height - homerunHeight(d.homerun));

      chartXAxis.transition().duration(1000).call(d3.axisBottom(xAxis));
      chartYAxis.transition().duration(1000).call(d3.axisLeft(homerunYAxis));
    }

    if (page === "4") {
      chartBars.transition().duration(1000).attr("height", 0).attr("y", 0);

      const cx = d3
        .scaleLinear()
        .domain([
          d3.min(allHomerunsData, (d) => d.distance_ft),
          d3.max(allHomerunsData, (d) => d.distance_ft),
        ])
        .range([0, CHART_DIMENSION.width]);
      const cy = d3
        .scaleLinear()
        .domain([
          d3.min(allHomerunsData, (d) => d.launch_angle),
          d3.max(allHomerunsData, (d) => d.launch_angle),
        ])
        .range([CHART_DIMENSION.height, 0]);
      const cr = d3
        .scaleLinear()
        .domain([
          d3.min(allHomerunsData, (d) => d.ev_mph),
          d3.max(allHomerunsData, (d) => d.ev_mph),
        ])
        .range([3, 8]);

      const allHomerunsXAxis = d3
        .scaleLinear()
        .domain([
          d3.min(allHomerunsData, (d) => d.distance_ft),
          d3.max(allHomerunsData, (d) => d.distance_ft),
        ])
        .range([0, CHART_DIMENSION.width]);

      chartCircles
        .attr("cx", (d) => cx(d.distance_ft))
        .attr("cy", (d) => cy(d.launch_angle))
        .transition()
        .duration(1000)
        .attr("r", (d) => cr(d.ev_mph));

      chartXAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(allHomerunsXAxis));
      chartYAxis.transition().duration(1000).call(d3.axisLeft(cy));
    }

    showContent(page);
  });
}

async function main(page) {
  page = page || "1";

  await drawTeamChart(page);
}

main("1");
