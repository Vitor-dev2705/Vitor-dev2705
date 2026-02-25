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
        .sort((a, b) => b.stargazers_count - a.stargazers_count);

      let cards = `<div align="center"><table><tr>`;
      let count = 0;

      repos.forEach((repo, index) => {
        if (count === 3) {
          cards += `</tr><tr>`;
          count = 0;
        }

        cards += `
<td align="center" width="33%">
<a href="${repo.html_url}">
<b>${repo.name}</b><br/>
${repo.description || "Sem descrição."}<br/>
⭐ ${repo.stargazers_count} | 🛠 ${repo.language || "N/A"}
</a>
</td>
        `;

        count++;
      });

      cards += `</tr></table></div>`;

      const readme = fs.readFileSync("README.md", "utf8");

      const updated = readme.replace(
        /<!--START_PROJECTS-->[\s\S]*<!--END_PROJECTS-->/,
        `<!--START_PROJECTS-->\n${cards}\n<!--END_PROJECTS-->`
      );

      fs.writeFileSync("README.md", updated);
    });
  }
);