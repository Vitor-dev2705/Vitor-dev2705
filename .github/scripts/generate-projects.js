import fs from "fs";
import fetch from "node-fetch";

const token = process.env.GITHUB_TOKEN;

async function updateReadme() {
  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      "User-Agent": "node",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error(`Erro na API: ${res.status}`);
    return;
  }

  const repos = await res.json();
  const filteredRepos = repos
    .filter(repo => !repo.fork && repo.name !== "Vitor-dev2705")
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

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
    /<!-- repos-start -->([\s\S]*?)<!-- repos-end -->/,
    `<!-- repos-start -->\n${content}\n<!-- repos-end -->`
  );

  fs.writeFileSync(readmePath, updated);
}

updateReadme().catch(err => console.error(err));