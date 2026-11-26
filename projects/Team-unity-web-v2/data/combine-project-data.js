
/* =============================================
   TEAM UNITY - COMBINED PROJECT DATA
============================================= */

window.projectDatas = [
    ...(window.projectDatas2026 || []),
    ...(window.projectDatas2025 || []),
    ...(window.projectDatas2024 || []),
    ...(window.projectDatas2023 || [])
];

console.log(
    "Team Unity: Project data loaded",
    window.projectDatas.length,
    "records"
);
