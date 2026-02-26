const fs = require("fs");
const https = require("https");

const token = process.env.GITHUB_TOKEN;

const options = {
  hostname: "api.github.com",
  path: "/user/repos?per_page=100&sort=updated",
  headers: {
    "User-Agent": "node",
    Authorization: `Bearer ${token}`
  }
};

https.get(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const repos = JSON.parse(data);
      const filteredRepos = repos
        .filter(repo => !repo.fork && repo.name !== "Vitor-dev2705")
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      // Gerando uma tabela limpa com links diretos
      let content = '\n<div align="center">\n<table width="100%">\n';
      
      for (let i = 0; i < filteredRepos.length; i += 2) {
        content += '  <tr>\n';
        for (let j = 0; j < 2; j++) {
          const repo = filteredRepos[i + j];
          if (repo) {
            content += `    <td width="50%" align="left">\n      <h3><a href="${repo.html_url}">📂 ${repo.name}</a></h3>\n      <p>${repo.description || "Sem descrição disponível."}</p>\n      <code>${repo.language || "Markdown"}</code> ⭐ ${repo.stargazers_count}\n    </td>\n`;
          }
        }
        content += '  </tr>\n';
      }
      content += '</table>\n</div>\n';

      const readmePath = "README.md";
      const readme = fs.readFileSync(readmePath, "utf8");
      const updated = readme.replace(
        /[\s\S]*/,
        `\n${content}\n`
      );

      fs.writeFileSync(readmePath, updated);
    } catch (e) {
      console.error(e.message);
    }
  });
});