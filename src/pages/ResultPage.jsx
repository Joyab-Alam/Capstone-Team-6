import { useState } from "react";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from "recharts";

export default function ResultPage() {
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [blockResults, setBlockResults] = useState(null);

  // NEW STATE FOR HELP MODAL
  const [showHelp, setShowHelp] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);

      const uniqueBlocks = [
        ...new Set(jsonData.map((row) => row.Block).filter(Boolean))
      ];
      setBlocks(uniqueBlocks);
    };
    reader.readAsBinaryString(file);
  };

  const calculateResults = (dataset, blockFilter) => {
    const gradeCounts = {
      HD: 0,
      D: 0,
      C: 0,
      P: 0,
      F: 0,
      GP: 0,
      FNE: 0,
      FNS: 0
    };
    let pass = 0;
    let fail = 0;

    dataset.forEach((row) => {
      if (blockFilter && row.Block !== blockFilter) return;
      const finalGrade = row["Final Grade"];
      if (finalGrade && gradeCounts.hasOwnProperty(finalGrade))
        gradeCounts[finalGrade]++;

      const rowTotal = parseFloat(row["Row Total"]);
      if (!isNaN(rowTotal)) rowTotal >= 50 ? pass++ : fail++;
    });

    const totalStudents = Object.values(gradeCounts).reduce(
      (a, b) => a + b,
      0
    );
    const gradePercentages = {};
    Object.keys(gradeCounts).forEach((grade) => {
      gradePercentages[grade] = totalStudents
        ? ((gradeCounts[grade] / totalStudents) * 100).toFixed(1)
        : 0;
    });

    return { pass, fail, gradeCounts, gradePercentages };
  };

  const handleCalculateAll = () => setResults(calculateResults(data, ""));
  const handleCalculateBlock = () =>
    setBlockResults(calculateResults(data, selectedBlock));

  const gradeColors = {
    HD: "#4caf50",
    D: "#2196f3",
    C: "#ff9800",
    P: "#9c27b0",
    F: "#f44336",
    GP: "#00bcd4",
    FNE: "#795548",
    FNS: "#607d8b"
  };

  const renderCharts = (res) => (
    <>
      <h2 className="text-xl font-semibold mb-2">Pass / Fail Distribution</h2>
      <div className="flex justify-center items-center mb-6">
        <PieChart
          width={250}
          height={250}
          className="shadow-lg rounded-full bg-white p-4"
        >
          <Pie
            data={[
              { name: "Pass", value: res.pass },
              { name: "Fail", value: res.fail }
            ]}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            <Cell fill="#4caf50" />
            <Cell fill="#f44336" />
          </Pie>
          <Tooltip formatter={(value) => `${value} students`} />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </div>

      <table className="w-full border-collapse border border-gray-400 mt-3 text-center">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">HD</th>
            <th className="border p-2">D</th>
            <th className="border p-2">C</th>
            <th className="border p-2">P</th>
            <th className="border p-2">F</th>
            <th className="border p-2">GP</th>
            <th className="border p-2">FNE</th>
            <th className="border p-2">FNS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">{res.gradeCounts.HD}</td>
            <td className="border p-2">{res.gradeCounts.D}</td>
            <td className="border p-2">{res.gradeCounts.C}</td>
            <td className="border p-2">{res.gradeCounts.P}</td>
            <td className="border p-2">{res.gradeCounts.F}</td>
            <td className="border p-2">{res.gradeCounts.GP}</td>
            <td className="border p-2">{res.gradeCounts.FNE}</td>
            <td className="border p-2">{res.gradeCounts.FNS}</td>
          </tr>
        </tbody>
      </table>

      <div className="data-main">
        <div className="frommain">
          <h3 className="text-xl font-semibold mt-6">
            Grade Count Bar Chart
          </h3>
          <BarChart
            width={500}
            height={300}
            data={Object.entries(res.gradeCounts).map(
              ([grade, count]) => ({ grade, count })
            )}
            className="mt-6"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count">
              {Object.entries(res.gradeCounts).map(([grade], index) => (
                <Cell
                  key={index}
                  fill={gradeColors[grade] || "#000"}
                />
              ))}
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </div>

        <div className="formmain">
          <h3 className="text-xl font-semibold mt-6">
            Grade Percentage Bar Chart
          </h3>
          <BarChart
            width={500}
            height={300}
            data={Object.entries(res.gradePercentages).map(
              ([grade, percent]) => ({
                grade,
                percent: parseFloat(percent)
              })
            )}
            className="mt-3"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade" />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="percent">
              {Object.entries(res.gradePercentages).map(
                ([grade], index) => (
                  <Cell
                    key={index}
                    fill={gradeColors[grade] || "#000"}
                  />
                )
              )}
              <LabelList
                dataKey="percent"
                position="top"
                formatter={(val) => `${val}%`}
              />
            </Bar>
          </BarChart>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HELP BUTTON ON TOP LEFT */}
      <button
        onClick={() => setShowHelp(true)}
        className="login-btn"
      >
        Help
      </button>

      <h2 className="text-2xl font-bold mb-4">Excel Result Analyzer</h2>

      <div className="formmain">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4 border border-gray-400 p-2 rounded"
        />

        <button onClick={handleCalculateAll} className="login-btn">
          Calculate All Results
        </button>
      </div>

      {results && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          {renderCharts(results)}
        </div>
      )}

      {blocks.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Calculate by Block Selection
          </h3>

          <label className="label-select">Select Block</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="select-input"
          >
            <option value="">Select Block</option>
            {blocks.map((b, idx) => (
              <option key={idx} value={b}>
                {b}
              </option>
            ))}
          </select>

          <button onClick={handleCalculateBlock} className="login-btn">
            Calculate Block
          </button>

          {blockResults && (
            <div className="mt-6">{renderCharts(blockResults)}</div>
          )}
        </div>
      )}

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-bold mb-3">How to Use This Page</h2>

            <p className="text-gray-700 text-sm mb-4">
              1. Upload your Excel file.<br /><br />
              2. Click <b>Calculate All Results</b> to view all student
              statistics.<br /><br />
              3. Select a Block to generate block-specific results.<br /><br />
              4. View charts & tables below for full analytics.
            </p>

            <button
              onClick={() => setShowHelp(false)}
              className="login-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
