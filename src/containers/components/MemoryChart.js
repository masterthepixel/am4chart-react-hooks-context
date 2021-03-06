import React, { useEffect, useContext, useState, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { MEMORY_CHART_DIV } from "../../constants";
import { Context as DashboardContext } from "../../context/dashboard";

function MemoryChart({ host }) {
  const [memoryGraphInstance, setMemoryGraphInstance] = useState(null);
  const mountedRef = useRef(true);

  const {
    getMemoryGraphData,
    state: { memoryData },
  } = useContext(DashboardContext);
  let interval = null;

  useEffect(() => {
    interval && clearInterval(interval);
    updateMemoryGraphData();
    interval = setInterval(() => {
      updateMemoryGraphData();
    }, 60000);
    return () => clearInterval(interval);
  }, [host]);

  const updateMemoryGraphData = () => {
    getMemoryGraphData({
      host: host.value,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      mountedRef.current && setMemoryGraphInstance(
        am4core.create(MEMORY_CHART_DIV, am4charts.PieChart)
      );
    }, 3000);
    return () => {
      memoryGraphInstance.dispose();
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!memoryGraphInstance) return;
    memoryGraphInstance.data = memoryData;
  }, [memoryData, memoryGraphInstance]);

  useEffect(() => {
    if (!memoryGraphInstance) return;
    const x = memoryGraphInstance;
    // Add and configure Series
    var pieSeries = x.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "percentage";
    pieSeries.dataFields.category = "status";
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.fontSize = 10;
    pieSeries.sequencedInterpolation = true;

    // Disabling labels and ticks on inner circle
    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;

    pieSeries.slices.template.states.getKey("hover").properties.shiftRadius = 0;
    pieSeries.slices.template.states.getKey("hover").properties.scale = 1.1;
    pieSeries.slices.template.states.getKey("hover").properties.fillOpacity = 0.5;
    x.legend = new am4charts.Legend();
    x.legend.fontSize = 12;
    x.legend.position = "bottom";
  }, [memoryGraphInstance]);

  return (
    <div className="memory-chart-card">
      <center className="chart-title">Current Memory Usage</center>
      <div className="chart-area">
        <div id={MEMORY_CHART_DIV} style={{ width: "100%", height: "400px" }}></div>
      </div>
    </div>
  );
}

export default MemoryChart;