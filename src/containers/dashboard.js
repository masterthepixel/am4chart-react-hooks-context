import React, { useState } from "react";
import Select from "react-select";
import "./dashboard.css";
import {
  CPU_METRICS,
  HOST_NAME_LIST,
  NETWORK_USAGES,
} from "../constants";
import CpuChart from "./components/CpuChart";
import NetworkChart from "./components/NetworkChart";
import MemoryChart from "./components/MemoryChart";

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "white" : "gray",
    backgroundColor: state.isSelected
      ? "blue"
      : state.isFocused
        ? "lightblue"
        : "white",
    padding: "5px 20px",
    fontSize: 15,
    textAlign: "left",
  }),
  control: (provided, state) => ({
    ...provided,
    fontSize: 15,
    height: "auto",
  }),
  container: (provided, state) => ({
    ...provided,
    width: 150,
  }),
};

function Dashboard() {
  const [selectedHost, selectHost] = useState(HOST_NAME_LIST[0]);
  // metric options for cpu and network graph
  const [cpuMetric, setCpuMetric] = useState(CPU_METRICS[0]);
  const [networkUsage, setNetworkUsage] = useState(NETWORK_USAGES[0]);

  return (
    <div className="App">
      <header className="App-header">
        <div id="host-selector">
          <p className="labelText">Select Host</p>
          <Select
            defaultValue={selectedHost}
            styles={customStyles}
            value={selectedHost}
            onChange={host => selectHost(host)}
            options={HOST_NAME_LIST}
            isSearchable={false}
          />
        </div>
        <div className="graph-container">
          <div id="cpu-network">
            <div id="cpu-status">
              <div className="cpu-metric-selector">
                <p className="labelText">CPU</p>
                <Select
                  defaultValue={cpuMetric}
                  styles={customStyles}
                  value={cpuMetric}
                  onChange={metric => setCpuMetric(metric)}
                  options={CPU_METRICS}
                  isSearchable={false}
                />
              </div>
              <CpuChart
                cpuMetric={cpuMetric}
                host={selectedHost}
              />
            </div>
            <div id="network-status">
              <div className="cpu-metric-selector">
                <p className="labelText">Network</p>
                <Select
                  defaultValue={networkUsage}
                  styles={customStyles}
                  value={networkUsage}
                  onChange={metric => setNetworkUsage(metric)}
                  options={NETWORK_USAGES}
                  isSearchable={false}
                />
              </div>
              <NetworkChart
                networkUsage={networkUsage}
                host={selectedHost}
              />
            </div>
          </div>
          <div id="memory-chart-container">
            <p className="labelText">Memory</p>
            <MemoryChart host={selectedHost} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
