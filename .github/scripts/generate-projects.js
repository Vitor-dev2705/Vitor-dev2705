const fs = require("fs");
const https = require("https");

const username = "Vitor-dev2705";

https.get(
  `https://api.github.com/users/${username}/repos?per_page=100`,
  { headers: { "User-Agent": "node" } },
  (res) => {
    let data = "";

    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      const repos = JSON.parse(data)
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      const cards = `
<div align="center">
<table>
<tr>
${repos.slice(0, 3).map(repo => `
<td align="center" width="33%">
<a href="${repo.html_url}">
<img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=tokyonight&border_radius=12&title_color=00ffff&icon_color=00ffff" />
</a>
</td>
`).join("")}
</tr>
<tr>
${repos.slice(3, 6).map(repo => `
<td align="center" width="33%">
<a href="${repo.html_url}">
<img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=tokyonight&border_radius=12&title_color=00ffff&icon_color=00ffff" />
</a>
</td>
`).join("")}
</tr>
</table>
</div>
`;

      const readme = fs.readFileSync("README.md", "utf8");

      const updated = readme.replace(
        /<!--START_PROJECTS-->[\s\S]*<!--END_PROJECTS-->/,
        `<!--START_PROJECTS-->${cards}<!--END_PROJECTS-->`
      );

      fs.writeFileSync("README.md", updated);
    });
  }
);