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
        .filter((repo) => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count);

      const table = `
<table>
<tr>
<th>Projeto</th>
<th>Descrição</th>
<th>Linguagem</th>
<th>⭐ Stars</th>
</tr>

${repos
  .map(
    (repo) => `
<tr>
<td><a href="${repo.html_url}">${repo.name}</a></td>
<td>${repo.description || "Sem descrição"}</td>
<td>${repo.language || "-"}</td>
<td>${repo.stargazers_count}</td>
</tr>`
  )
  .join("")}

</table>
`;

      const readme = fs.readFileSync("README.md", "utf8");

      const updated = readme.replace(
        /<!--START_PROJECTS-->[\s\S]*<!--END_PROJECTS-->/,
        `<!--START_PROJECTS-->${table}<!--END_PROJECTS-->`
      );

      fs.writeFileSync("README.md", updated);
    });
  }
);