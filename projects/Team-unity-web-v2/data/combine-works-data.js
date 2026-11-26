
/* =============================================
   TEAM UNITY - COMBINED WORKS DATA
============================================= */

window.allWorksData = [
    ...(window.worksData2026 || []),
    ...(window.worksData2025 || []),
    ...(window.worksData2024 || []),
    ...(window.worksData2023 || [])
];

console.log(
    "Team Unity: Works data loaded",
    window.allWorksData.length,
    "records"
);
