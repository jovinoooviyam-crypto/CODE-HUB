
/* =============================================
   TEAM UNITY - COMBINED WORKS DATA
============================================= */

window.allWorksData = [
    ...(window.worksData2026 || []),
    ...(window.worksData2025 || [])
];

console.log(
    "Team Unity: Works data loaded",
    window.allWorksData.length,
    "records"
);
