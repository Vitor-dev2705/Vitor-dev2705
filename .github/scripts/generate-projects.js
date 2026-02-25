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

    // Ordena por estrelas e depois por atualização
    repos.sort((a, b) => {
      if (b.stargazers_count === a.stargazers_count) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      return b.stargazers_count - a.stargazers_count;
    });

    const topProjects = repos.slice(0, 6);
    const otherProjects = repos.slice(6);

    // ====== SEÇÃO DE DESTAQUE ======
    let topSection = `
<h3 align="center">🔥 Projetos em Destaque</h3>

<div align="center">
`;

    topProjects.forEach(repo => {
      topSection += `
<div style="
  display:inline-block;
  width:45%;
  margin:10px;
  padding:15px;
  border-radius:12px;
  background-color:#0d1117;
  border:1px solid #30363d;
  vertical-align:top;
">
  <a href="${repo.html_url}" style="text-decoration:none;">
    <h3>${repo.name}</h3>
    <p>${repo.description || "Projeto Full Stack"}</p>
    <p>
      ⭐ ${repo.stargazers_count} &nbsp; | &nbsp;
      🛠 ${repo.language || "N/A"} &nbsp; | &nbsp;
      ${repo.private ? "🔒 Privado" : "🌍 Público"}
    </p>
  </a>
</div>
`;
    });

    topSection += `</div>`;

    // ====== OUTROS PROJETOS ======
    let otherSection = `
<br/>

<h3 align="center">📦 Outros Projetos</h3>

<div align="center">
`;

    otherProjects.forEach(repo => {
      otherSection += `
<div style="
  margin:6px;
">
  <a href="${repo.html_url}">
    <b>${repo.name}</b>
  </a>
  — ${repo.language || "N/A"} ${repo.private ? "🔒" : ""}
</div>
`;
    });

    otherSection += `</div>`;

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