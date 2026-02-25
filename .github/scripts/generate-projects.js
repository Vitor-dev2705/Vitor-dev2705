const fs = require("fs");
const https = require("https");

const username = "Vitor-dev2705";
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
    const repos = JSON.parse(data)
      .filter(repo => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    let content = `<div align="center">\n<table>\n<tr>\n`;
    let col = 0;

    repos.forEach(repo => {
      if (col === 3) {
        content += `</tr>\n<tr>\n`;
        col = 0;
      }

      content += `
<td align="center" width="33%">
<a href="${repo.html_url}">
<b>${repo.name}</b><br/>
${repo.description || "Sem descrição."}<br/>
⭐ ${repo.stargazers_count} | 🛠 ${repo.language || "N/A"}
</a>
</td>
`;

      col++;
    });

    content += `</tr>\n</table>\n</div>`;

    const readme = fs.readFileSync("README.md", "utf8");

    const updated = readme.replace(
      /<!--START_PROJECTS-->[\s\S]*<!--END_PROJECTS-->/,
      `<!--START_PROJECTS-->\n${content}\n<!--END_PROJECTS-->`
    );

    fs.writeFileSync("README.md", updated);
  });
});