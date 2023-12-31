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
  let data = await d3.csv(BASE_URL + "/data/homerun_by_team.csv");
  data = data.slice().sort((a, b) => d3.ascending(a.pitches, b.pitches));

  const mostPitches = d3.max(data, (d) => d.pitches);
  const mostInplays = d3.max(data, (d) => d.inplay);
  const mostHomeruns = d3.max(data, (d) => d.homerun);

  const allHomerunsData = await d3.csv(
    BASE_URL + "/data/all_homeruns.csv",
    (d) => ({
      distance_ft: +d.distance_ft,
      launch_angle: +d.launch_angle,
      ev_mph: +d.ev_mph,
      pitch_mph: +d.pitch_mph,
      player: d.player,
    })
  );

  const longestDistance = d3.max(allHomerunsData, (d) => d.distance_ft);
  const highestLaunchAngle = d3.max(allHomerunsData, (d) => d.launch_angle);

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
          `<img src="${BASE_URL}/img/${d.team}.svg" /><p>Team: ${
            d.team
          }</p><p>Pitches: ${d.pitches} ${
            d.pitches === mostPitches ? "<i>(most)</i>" : ""
          }</p><p>In play: ${d.inplay} ${
            d.inplay === mostInplays ? "<i>(most)</i>" : ""
          }
          </p><p>Homerun: ${d.homerun} ${
            d.homerun === mostHomeruns ? "<i>(most)</i>" : ""
          }</p>`
        );
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  const chartXAxis = svg
    .append("g")
    .attr(
      "transform",
      `translate(${MARGIN},${CHART_DIMENSION.height + MARGIN})`
    );

  chartXAxis.call(d3.axisBottom(xAxis));

  chartXAxis
    .append("text")
    .classed("x-axis-title", true)
    .attr("x", CHART_DIMENSION.width / 2)
    .attr("y", 30)
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Team");

  const chartYAxis = svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`);

  chartYAxis.call(d3.axisLeft(yAxis));

  chartYAxis
    .append("text")
    .classed("y-axis-title", true)
    .attr("x", -CHART_DIMENSION.height / 2)
    .attr("y", -42)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("Pitches");

  const annotations = {
    page1: [
      {
        note: { title: "Most pitches faced" },
        x: CHART_DIMENSION.width + MARGIN - width / 2,
        y: MARGIN + 10,
        dy: -20,
        dx: -100,
      },
    ],
    page2: [
      {
        note: { title: "Most in plays" },
        x: CHART_DIMENSION.width - 220,
        y: MARGIN + 10,
        dy: -20,
        dx: -100,
      },
    ],
    page3: [
      {
        note: { title: "Most homeruns" },
        x: CHART_DIMENSION.width - 2,
        y: MARGIN + 10,
        dy: -20,
        dx: -100,
      },
    ],
    page4: [
      {
        note: { title: "Longest distance" },
        x: CHART_DIMENSION.width + MARGIN,
        y: MARGIN + 90,
        dy: -20,
        dx: -80,
      },
      {
        note: { title: "Highest angle" },
        x: CHART_DIMENSION.width - 410,
        y: MARGIN,
        dy: -20,
        dx: 100,
      },
    ],
  };

  const page1Annotation = d3
    .select("svg")
    .append("g")
    .call(
      d3.annotation().type(d3.annotationLabel).annotations(annotations.page1)
    );

  page1Annotation
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .style("opacity", 1);

  const page2Annotation = d3
    .select("svg")
    .append("g")
    .call(
      d3.annotation().type(d3.annotationLabel).annotations(annotations.page2)
    );

  page2Annotation.style("opacity", 0);

  const page3Annotation = d3
    .select("svg")
    .append("g")
    .call(
      d3.annotation().type(d3.annotationLabel).annotations(annotations.page3)
    );

  page3Annotation.style("opacity", 0);

  const page4Annotation = d3
    .select("svg")
    .append("g")
    .call(
      d3.annotation().type(d3.annotationLabel).annotations(annotations.page4)
    );

  page4Annotation.style("opacity", 0);

  const chartCirclesFill = d3
    .scaleLinear()
    .domain([
      d3.min(allHomerunsData, (d) => d.pitch_mph),
      d3.max(allHomerunsData, (d) => d.pitch_mph),
    ])
    .range(["rgba(0, 255, 0, 0.9)", "rgba(255, 0, 0, 0.9)"]);

  const chartCircles = svg
    .append("g")
    .attr("transform", `translate(${MARGIN},${MARGIN})`)
    .selectAll("circle")
    .data(allHomerunsData)
    .enter()
    .append("circle")
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
          `<p>Player: ${d.player}</p><p>Pitch (mph): ${
            d.pitch_mph
          } <span class="pitch-mph-circle" style="background-color: ${chartCirclesFill(
            d.pitch_mph
          )};"></span></p><p>Exit velocity (mph): ${
            d.ev_mph
          }</p><p>Launch angle (degree): ${d.launch_angle} ${
            d.launch_angle === highestLaunchAngle ? "<i>(highest)</i>" : ""
          }</p><p>Distance (ft): ${d.distance_ft} ${
            d.distance_ft === longestDistance ? "<i>(longest)</i>" : ""
          }</p>`
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
      chartXAxis.select("text.x-axis-title").text("Team");
      chartYAxis.select("text.y-axis-title").text("Pitches");

      page1Annotation.transition().duration(1000).style("opacity", 1);
      page2Annotation.transition().duration(1000).style("opacity", 0);
      page3Annotation.transition().duration(1000).style("opacity", 0);
      page4Annotation.transition().duration(1000).style("opacity", 0);
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
      chartXAxis.select("text.x-axis-title").text("Team");
      chartYAxis.select("text.y-axis-title").text("In plays");

      page1Annotation.transition().duration(1000).style("opacity", 0);
      page2Annotation.transition().duration(1000).style("opacity", 1);
      page3Annotation.transition().duration(1000).style("opacity", 0);
      page4Annotation.transition().duration(1000).style("opacity", 0);
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
      chartXAxis.select("text.x-axis-title").text("Team");
      chartYAxis.select("text.y-axis-title").text("Homeruns");

      page1Annotation.transition().duration(1000).style("opacity", 0);
      page2Annotation.transition().duration(1000).style("opacity", 0);
      page3Annotation.transition().duration(1000).style("opacity", 1);
      page4Annotation.transition().duration(1000).style("opacity", 0);
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
        .style("fill", (d) => chartCirclesFill(d.pitch_mph))
        .transition()
        .duration(1000)
        .attr("r", (d) => cr(d.ev_mph));

      chartXAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(allHomerunsXAxis));
      chartXAxis.selectAll("text.x-axis-title").text("Distance (ft)");
      chartYAxis.transition().duration(1000).call(d3.axisLeft(cy));
      chartYAxis.selectAll("text.y-axis-title").text("Launch angle (degree)");

      page1Annotation.transition().duration(1000).style("opacity", 0);
      page2Annotation.transition().duration(1000).style("opacity", 0);
      page3Annotation.transition().duration(1000).style("opacity", 0);
      page4Annotation.transition().duration(1000).style("opacity", 1);
    }

    showContent(page);
  });
}

async function main(page) {
  page = page || "1";

  await drawTeamChart(page);
}

main("1");
