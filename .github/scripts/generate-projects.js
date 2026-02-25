const fs = require("fs");
const https = require("https");

const token = process.env.GITHUB_TOKEN;

const options = {
  hostname: "api.github.com",
  path: "/user/repos?per_page=100",
  headers: {
    "User-Agent": "node",
    Authorization: `Bearer ${token}`
  }
};

https.get(options, (res) => {
  let data = "";

  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    let repos = JSON.parse(data)
      .filter(repo => !repo.fork && repo.size > 0);

    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    const topProjects = repos.slice(0, 6);
    const otherProjects = repos.slice(6);

    const buildCard = (repo) => `
<td align="center" width="33%">
<a href="${repo.html_url}">
<b>${repo.name}</b><br/>
${repo.description || "Projeto Full Stack"}<br/>
⭐ ${repo.stargazers_count} | 🛠 ${repo.language || "N/A"}
</a>
</td>
`;

    let topSection = `<h3>🔥 Projetos em Destaque</h3>\n<div align="center"><table><tr>`;
    let col = 0;

    topProjects.forEach(repo => {
      if (col === 3) {
        topSection += `</tr><tr>`;
        col = 0;
      }
      topSection += buildCard(repo);
      col++;
    });

    topSection += `</tr></table></div>`;

    let otherSection = `\n\n<h3>📦 Outros Projetos</h3>\n`;

    otherProjects.forEach(repo => {
      otherSection += `- [${repo.name}](${repo.html_url}) — ${repo.language || "N/A"}\n`;
    });

    const finalContent = `
${topSection}
${otherSection}
`;

    const readme = fs.readFileSync("README.md", "utf8");

    const updated = readme.replace(
      /<!--START_PROJECTS-->[\s\S]*<!--END_PROJECTS-->/,
      `<!--START_PROJECTS-->\n${finalContent}\n<!--END_PROJECTS-->`
    );

    fs.writeFileSync("README.md", updated);
  });
});