import React, { useEffect, useState, useContext } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import Select from "react-select";
import moment from "moment";
import { CPU_CHART_DIV, LAST_TIME_OPTIONS } from "../../constants";
import { Context as DashboardContext } from "../../context/dashboard";
const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "white" : "gray",
    backgroundColor: state.isSelected ? "blue" : state.isFocused ? "lightblue" : "white",
    padding: "5px 20px",
    fontSize: 12,
    textAlign: "left"
  }),
  control: (provided, state) => ({
    ...provided,
    fontSize: 12,
    height: "auto"
  }),
};

function CpuChart({ host, cpuMetric }) {
  const [cpuGraphInstance, setCpuGraphInstance] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [showWizard, setShowWizard] = useState(false);
  const [cpuDuration, setCpuDuration] = useState(LAST_TIME_OPTIONS[0]);

  const {
    getCPUGraphData,
    state: { cpuData },
  } = useContext(DashboardContext);
  let interval = null;

  useEffect(() => {
    interval && clearInterval(interval);
    updateCPUGraphData();
    interval = setInterval(() => {
      updateCPUGraphData();
    }, 60000);
    return () => clearInterval(interval);
  }, [cpuMetric, cpuDuration, host]);

  const updateCPUGraphData = () => {
    getCPUGraphData({
      host: host.value,
      cpu: cpuMetric.value,
      cpuLastTime: cpuDuration.value,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setCpuGraphInstance(am4core.create(CPU_CHART_DIV, am4charts.XYChart));
    }, 3000);
    return () => {
      cpuGraphInstance.dispose();
    };
  }, []);

  useEffect(() => {
    if (!cpuGraphInstance) return;
    cpuGraphInstance.data = cpuData.map(i => ({
      value: i[0],
      timestamp: i[1],
    }));
  }, [cpuData, cpuGraphInstance]);

  useEffect(() => {
    if (!cpuGraphInstance) return;
    const x = cpuGraphInstance;
    x.paddingRight = 20;
    var categoryAxis = x.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "timestamp";
    // categoryAxis.visible = false;
    // categoryAxis.renderer.grid.template.location = 0.5
    categoryAxis.renderer.fixedWidthGrid = 2;
    categoryAxis.renderer.labels.template.adapter.add("text", (label, target, key) => {
      const number = target.dataItem.properties.category;
      return moment(number * 1000).format("hh:mm A");
    });
    categoryAxis.renderer.minGridDistance = 80;
    categoryAxis.startLocation = 0;
    categoryAxis.endLocation = 1;
    categoryAxis.fontSize = "9px";
    categoryAxis.adapter.add("getTooltipText", (text, target, key) => {
      return moment(text * 1000).format("MMM Do, hh:mm a");
    });

    var valueAxis = x.yAxes.push(new am4charts.ValueAxis());
    valueAxis.baseValue = 0;
    valueAxis.fontSize = "9px";

    if (x.series.length) x.series.removeIndex(0);
    var LineSeries = x.series.push(new am4charts.LineSeries());
    LineSeries.dataFields.valueY = "value";
    LineSeries.dataFields.categoryX = "timestamp";
    LineSeries.strokeWidth = 2;
    LineSeries.tensionX = 0.77;
    LineSeries.stroke = am4core.color("red");
    let bullet = LineSeries.bullets.push(new am4charts.Bullet());
    bullet.tooltipText = "{valueY}";

    // update chart data without reloading
    LineSeries.sequencedInterpolation = true;

    let range = valueAxis.createSeriesRange(LineSeries);
    range.value = 0;
    range.endValue = 1000;
    range.contents.stroke = am4core.color("#FF0000");
    range.contents.fill = range.contents.stroke;

    var BarSeries = x.series.push(new am4charts.ColumnSeries());
    BarSeries.dataFields.valueY = "value";
    BarSeries.dataFields.categoryX = "timestamp";
    BarSeries.strokeWidth = 2;
    BarSeries.tensionX = 0.77;
    BarSeries.stroke = am4core.color("red");
    BarSeries.hide();
    bullet = BarSeries.bullets.push(new am4charts.Bullet());
    bullet.tooltipText = "{valueY}";

    // update chart data without reloading
    BarSeries.sequencedInterpolation = true;

    range = valueAxis.createSeriesRange(BarSeries);
    range.value = 0;
    range.endValue = 1000;
    range.contents.stroke = am4core.color("#FF0000");
    range.contents.fill = range.contents.stroke;
    x.cursor = new am4charts.XYCursor();
    setShowWizard(true);
  }, [cpuGraphInstance]);

  useEffect(() => {
    if (!cpuGraphInstance) return;
    if (chartType === "line") {
      cpuGraphInstance.series._values[0].show();
      cpuGraphInstance.series._values[1].hide();
    } else {
      cpuGraphInstance.series._values[0].hide();
      cpuGraphInstance.series._values[1].show();
    }
  }, [chartType, cpuGraphInstance]);

  const onChange = (e) => {
    setChartType(e.target.value);
  };

  return (
    <div className="single-line-chart-card">
      <div className="graph-help-top-view">
        <p className="unitText">{"%"}</p>
        <div className="duration-selector">
          <Select
            defaultValue={LAST_TIME_OPTIONS[0]}
            styles={customStyles}
            onChange={setCpuDuration}
            options={LAST_TIME_OPTIONS}
            isSearchable={false}
          />
        </div>
      </div>
      <center className="chart-title">{`CPU - ${cpuMetric.label}`}</center>
      <div className="chart-area">
        <div id={CPU_CHART_DIV} style={{ width: "100%", height: "300px" }}></div>
      </div>
      {showWizard && (
        <div className="chart-type-container">
          <form className="chart-type-form">
            <input type="radio" id="cpu-line" name="Line" value="line" onChange={onChange} checked={chartType === "line"} />
            <label className="chart-type-label" htmlFor="Line">Line</label>
            <input type="radio" id="cpu-bar" name="Bar" value="bar" onChange={onChange} checked={chartType === "bar"} />
            <label className="chart-type-label" htmlFor="Bar">Bar</label>
          </form>
        </div>
      )}

    </div>
  );
}

export default CpuChart;