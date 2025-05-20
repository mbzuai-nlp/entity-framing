// Data with definitions, examples, etc.


  
  // Color scales
  const roleColors = {
    protagonist: "#1f77b4", // blue
    antagonist: "#d62728", // red
    innocent: "#2ca02c"    // green
  };
  
  // Function to lighten color for children
  function lightenColor(color, percent) {
    const num = parseInt(color.slice(1),16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return "#" + (
      0x1000000 + 
      (R<255?R<1?0:R:255)*0x10000 + 
      (G<255?G<1?0:G:255)*0x100 + 
      (B<255?B<1?0:B:255)
      ).toString(16).slice(1);
  }

  function highlightEntity(text, entity) {
    if (!entity || !text) return text;
    const regex = new RegExp(`(${entity})`, 'gi'); // case-insensitive
    return text.replace(regex, `<span class="highlighted-entity">$1</span>`);
  }


  function highlightSpan(text, span, node) {
    if (!span || span.length !== 2) return text;
  
    const [start, end] = span;
    const before = text.slice(0, start);
    const highlight = text.slice(start, end);
    const after = text.slice(end);
  
    // Determine role (look up ancestor if needed)
    let role = node.data.role;
    let current = node;
    while (!role && current.parent) {
      current = current.parent;
      role = current.data.role;
    }
  
    const color = roleColors[role] || "#ffc"; // fallback light yellow
  
    return `${before}<span class="highlighted-entity" style="background-color: ${color}; color: white; font-weight: bold; padding: 0 2px; border-radius: 2px;">${highlight}</span>${after}`;
  }
  
  

  d3.json("assets/data/taxonomy.json").then(taxonomyData => {

  // Set dimensions
  const margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;
  
  let i = 0,
    duration = 350;
  
  const tree = d3.tree().size([height, width]);
  
  const svg = d3.select("#taxonomy").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .style("font", "14px sans-serif")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  
  let root = d3.hierarchy(taxonomyData, d => d.children);
  root.x0 = height / 2;
  root.y0 = 0;
  
  // Collapse all except root children
  root.children.forEach(collapse);
  
  update(root);
  
  function collapse(d) {
    if(d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  
  function update(source) {
    const treeData = tree(root);
    const nodes = treeData.descendants(),
          links = treeData.links();
  
    nodes.forEach(d => {
      d.y = d.depth * 180;
    });
  
    // Nodes
    const node = svg.selectAll('g.node')
      .data(nodes, d => d.id || (d.id = ++i));
  
    // Enter new nodes at parent's previous position
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", d => `translate(${source.y0},${source.x0})`)
      .on('click', (event,d) => {
        if(d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      })
      .on("mouseover", (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
          tooltip.html(() => {
            if (d.depth === 1) {
              // Main roles: Just name and raw definition
              return `
                <strong>${d.data.name}</strong><br/><br/>
                ${d.data.definition || ""}
              `;
            } else if (d.depth > 1) {
              // Children nodes: structure content neatly
              return `
                <strong>${d.data.name}</strong><br/><br/>
                ${d.data.definition ? `<div><strong>Definition:</strong> ${d.data.definition}</div><br/>` : ""}
                ${d.data.conceptual ? `<div><strong>Conceptual Instances:</strong><br/>${d.data.conceptual}</div><br/>` : ""}
                ${d.data.example ? `<div><strong>Example:</strong><br/><em>${highlightSpan(d.data.example, d.data.highlight_span, d)}</em></div>` : ""}
              `;
            } else {
              // Root node (if you have one): just name
              return `<strong>${d.data.name}</strong>`;
            }
          })
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px");
          
      });
  
    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .attr("fill", d => {
        // determine base color
        // root = depth 0, Protagonist, Antagonist, Innocent = depth 1
        if(d.depth === 1) {
          return roleColors[d.data.role] || "#999";
        } else if (d.depth > 1) {
          // find ancestor at depth 1 for coloring
          let ancestor = d;
          while(ancestor.depth > 1) ancestor = ancestor.parent;
          const baseColor = roleColors[ancestor.data.role] || "#999";
          return lightenColor(baseColor, 50);
        }
        return "#fff";
      })
      .attr("stroke", d => {
        if(d.depth === 1) {
          return roleColors[d.data.role] || "#999";
        } else if (d.depth > 1) {
          let ancestor = d;
          while(ancestor.depth > 1) ancestor = ancestor.parent;
          return roleColors[ancestor.data.role] || "#999";
        }
        return "#999";
      })
      .attr("stroke-width", 2);
  
    nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", d => d.children || d._children ? -13 : 13)
      .attr("text-anchor", d => d.children || d._children ? "end" : "start")
      .text(d => d.data.name);
  
    // UPDATE + ENTER nodes
    const nodeUpdate = nodeEnter.merge(node);
  
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`);
  
    nodeUpdate.select('circle')
      .attr('r', 10)
      .attr("fill", d => {
        if(d.depth === 1) {
          return roleColors[d.data.role] || "#999";
        } else if (d.depth > 1) {
          let ancestor = d;
          while(ancestor.depth > 1) ancestor = ancestor.parent;
          const baseColor = roleColors[ancestor.data.role] || "#999";
          return lightenColor(baseColor, 50);
        }
        return "#fff";
      })
      .attr("stroke", d => {
        if(d.depth === 1) {
          return roleColors[d.data.role] || "#999";
        } else if (d.depth > 1) {
          let ancestor = d;
          while(ancestor.depth > 1) ancestor = ancestor.parent;
          return roleColors[ancestor.data.role] || "#999";
        }
        return "#999";
      })
      .attr("stroke-width", 2);
  
    nodeUpdate.select('text')
      .style("fill-opacity", 1);
  
    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", d => `translate(${source.y},${source.x})`)
      .remove();
  
    nodeExit.select('circle')
      .attr('r', 1e-6);
  
    nodeExit.select('text')
      .style("fill-opacity", 1e-6);
  
    // Links
    const link = svg.selectAll('path.link')
      .data(links, d => d.target.id);
  
    // Enter new links at parent's previous position
    const linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', d => {
        const o = {x: source.x0, y: source.y0};
  return diagonal(o, o);
  });
  
  // UPDATE + ENTER links
  const linkUpdate = linkEnter.merge(link);
  
  linkUpdate.transition()
  .duration(duration)
  .attr('d', d => diagonal(d.source, d.target));
  
  // Remove exiting links
  const linkExit = link.exit().transition()
  .duration(duration)
  .attr('d', d => {
  const o = {x: source.x, y: source.y};
  return diagonal(o, o);
  })
  .remove();
  
  // Save positions for transition
  nodes.forEach(d => {
  d.x0 = d.x;
  d.y0 = d.y;
  });
  }
  
  function diagonal(s, d) {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  }
});