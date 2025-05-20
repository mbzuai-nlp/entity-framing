// assets/js/stats.js
(() => {
  const data = [
    { label: 'Articles',  value: 1378 },
    { label: 'Languages', value: 5    },
    { label: 'Mentions',  value: 5800 },
    { label: 'Roles',     value: 22   }
  ];

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const width  = 500 - margin.left - margin.right;
  const height = 200 - margin.top  - margin.bottom;

  const svg = d3.select('#dataset-stats')
    .append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top  + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

  // X axis
  svg.append('g')
     .attr('transform', `translate(0,${height})`)
     .call(d3.axisBottom(x));

  // Y axis
  svg.append('g')
     .call(d3.axisLeft(y).ticks(5));

  // Bars
  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x',      d => x(d.label))
      .attr('y',      d => y(d.value))
      .attr('width',  x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill',   '#1f77b4');
})();
