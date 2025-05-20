// taxonomy.js

// Color scales
const roleColors = {
  protagonist: "#1f77b4", // blue
  antagonist: "#d62728",  // red
  innocent: "#2ca02c"     // green
};

// Function to lighten color for children
function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

function highlightSpan(text, span, node) {
  if (!span || span.length !== 2) return text;
  const [start, end] = span;
  const before = text.slice(0, start);
  const highlight = text.slice(start, end);
  const after = text.slice(end);
  let role = node.data.role;
  let current = node;
  while (!role && current.parent) {
    current = current.parent;
    role = current.data.role;
  }
  const color = roleColors[role] || "#ffc";
  return `${before}<span class="highlighted-entity" style="background-color: ${color}; color: white; font-weight: bold; padding: 0 2px; border-radius: 2px;">${highlight}</span>${after}`;
}

// Load taxonomy data
d3.json("assets/data/taxonomy.json").then(taxonomyData => {
  const margin = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;
  let i = 0,
    duration = 350;
  const tree = d3.tree().size([height, width]);

  const svg = d3.select(".widget-container #taxonomy").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .style("font", "14px sans-serif")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Hide tooltip when clicking outside any node
  d3.select("body").on("click", () => {
    tooltip.transition().duration(200).style("opacity", 0);
  });

  let root = d3.hierarchy(taxonomyData, d => d.children);
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse all except root children
  root.children.forEach(collapse);
  update(root);

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function update(source) {
    const treeData = tree(root);
    const nodes = treeData.descendants(), links = treeData.links();
    nodes.forEach(d => { d.y = d.depth * 180; });

    // Nodes
    const node = svg.selectAll('g.node')
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", d => `translate(${source.y0},${source.x0})`)
      // Hover for first-level only
      .on('mouseover', (event, d) => {
        if (d.depth === 1) {
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`
            <strong>${d.data.name}</strong><br/><br/>
            ${d.data.definition || ""}
          `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on('mouseout', (event, d) => {
        if (d.depth === 1) {
          tooltip.transition().duration(200).style("opacity", 0);
        }
      })
      // Click for expand/collapse and tooltip for depth > 1
      .on('click', (event, d) => {
        // expand/collapse
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
        event.stopPropagation();

        // Tooltip for depth > 1 nodes, always center-right of widget
        if (d.depth > 1) {
          // Find the taxonomy widget container
          const widget = document.getElementById('taxonomy-widget');
          const widgetRect = widget.getBoundingClientRect();

          // Prepare tooltip content first (hidden offscreen to measure)
          tooltip.style("opacity", 0)
            .style("left", "-9999px")
            .style("top", "-9999px")
            .html(() => {
              let content = `<strong>${d.data.name}</strong><br/><br/>`;
              if (d.data.definition) content += `<div><strong>Definition:</strong> ${d.data.definition}</div><br/>`;
              if (d.data.conceptual) content += `<div><strong>Conceptual Instances:</strong><br/>${d.data.conceptual}</div><br/>`;
              if (d.data.example) content += `<div><strong>Example:</strong><br/><em>${highlightSpan(d.data.example, d.data.highlight_span, d)}</em></div>`;
              return content;
            });

          // Get tooltip size
          const tooltipNode = tooltip.node();
          const tooltipWidth = tooltipNode.offsetWidth;
          const tooltipHeight = tooltipNode.offsetHeight;

          // Compute position: center vertically, right-aligned (inside the widget)
          const left = widgetRect.right - tooltipWidth - 30 + window.scrollX; // 30px padding inside right edge
          const top = widgetRect.top + (widgetRect.height / 2) - (tooltipHeight / 2) + window.scrollY;

          tooltip
            .style("left", `${left}px`)
            .style("top", `${top}px`)
            .transition().duration(200).style("opacity", 0.97);
        }
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .attr("fill", d => {
        if (d.depth === 1) return roleColors[d.data.role] || "#999";
        else if (d.depth > 1) {
          let ancestor = d;
          while (ancestor.depth > 1) ancestor = ancestor.parent;
          return lightenColor(roleColors[ancestor.data.role] || "#999", 50);
        }
        return "#fff";
      })
      .attr("stroke", d => {
        if (d.depth === 1) return roleColors[d.data.role] || "#999";
        else if (d.depth > 1) {
          let ancestor = d;
          while (ancestor.depth > 1) ancestor = ancestor.parent;
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

    // UPDATE + ENTER
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition().duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`);
    nodeUpdate.select('circle')
      .attr('r', 10)
      .attr("fill", d => {
        if (d.depth === 1) return roleColors[d.data.role] || "#999";
        else if (d.depth > 1) {
          let ancestor = d;
          while (ancestor.depth > 1) ancestor = ancestor.parent;
          return lightenColor(roleColors[ancestor.data.role] || "#999", 50);
        }
        return "#fff";
      })
      .attr("stroke", d => {
        if (d.depth === 1) return roleColors[d.data.role] || "#999";
        else if (d.depth > 1) {
          let ancestor = d;
          while (ancestor.depth > 1) ancestor = ancestor.parent;
          return roleColors[ancestor.data.role] || "#999";
        }
        return "#999";
      })
      .attr("stroke-width", 2);
    nodeUpdate.select('text').style("fill-opacity", 1);

    // EXIT
    const nodeExit = node.exit().transition().duration(duration)
      .attr("transform", d => `translate(${source.y},${source.x})`)
      .remove();
    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text').style("fill-opacity", 1e-6);

    // LINKS
    const link = svg.selectAll('path.link').data(links, d => d.target.id);
    const linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });
    const linkUpdate = linkEnter.merge(link);
    linkUpdate.transition().duration(duration)
      .attr('d', d => diagonal(d.source, d.target));
    const linkExit = link.exit().transition().duration(duration)
      .attr('d', d => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // Save positions
    nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });
  }

  function diagonal(s, d) {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  }
});

// Theme toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  if (!toggleBtn || !themeIcon) {
    console.error('Toggle button or icon not found in DOM');
    return;
  }
  toggleBtn.addEventListener('click', () => {
    const dark = document.querySelector('html').classList.toggle('dark-theme');
    if (dark) {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
  });
});
