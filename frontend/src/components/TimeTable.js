import React from "react";

const schedule = [
  { time: "9:00 - 10:00",  Mon: "Data Structures",   Tue: "Algotithms",         Wed: "Operating system",  Thu: "Algorithms",      Fri: "Lab" },
  { time: "10:00 - 11:00", Mon: "Algorithms",        Tue: "Data Structures",    Wed: "Data Structures",   Thu: "Data structure",  Fri: "Lab"},
  { time: "11:00 - 12:00", Mon: "Operating system",  Tue: "Operating system",   Wed: "Algorithms",        Thu: "Operating System",Fri: "Sports" },
  { time: "1:00 - 2:00",   Mon: "DBMS",              Tue: "Computer Networks",  Wed: "Computer Networks", Thu: "No - class",      Fri: "Library" },
  { time: "2:00 - 3:00",   Mon: "Computer networks", Tue: "Lab",                Wed: "Core Sub",          Thu: "Lab",             Fri: "Activity" },
];

function TimeTable() {
  return (
    <div className="content">
      <h3>🗓️ Weekly Time Table</h3>
      <table className="timetable">
        <thead>
          <tr>
            <th>Time</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, i) => (
            <tr key={i}>
              <td><strong>{row.time}</strong></td>
              <td>{row.Mon}</td>
              <td>{row.Tue}</td>
              <td>{row.Wed}</td>
              <td>{row.Thu}</td>
              <td>{row.Fri}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimeTable;
