const fs = require("fs");
const https = require("https");
const path = require("path");

const token = process.env.GITHUB_TOKEN;


const readmePath = path.join(__dirname, "../../README.md");

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
      
      if (!Array.isArray(repos)) {
        console.error("Erro na API do GitHub:", repos);
        return;
      }

      const filteredRepos = repos
        .filter(repo => !repo.fork && repo.size > 0 && repo.name !== "Vitor-dev2705")
        .sort((a, b) => {
          if (b.stargazers_count === a.stargazers_count) {
            return new Date(b.updated_at) - new Date(a.updated_at);
          }
          return b.stargazers_count - a.stargazers_count;
        });

      const topProjects = filteredRepos.slice(0, 6);
      const otherProjects = filteredRepos.slice(6);

      let topSection = `<h3 align="center">🔥 Projetos em Destaque</h3>\n<div align="center">\n`;

      topProjects.forEach(repo => {
        topSection += `
<div style="display:inline-block; width:45%; margin:10px; padding:15px; border-radius:12px; background-color:#0d1117; border:1px solid #30363d; vertical-align:top; text-align:left;">
  <a href="${repo.html_url}" style="text-decoration:none; color:#58a6ff;">
    <h3 style="margin-top:0;">${repo.name}</h3>
    <p style="color:#8b949e; font-size:14px;">${repo.description || "Projeto Full Stack"}</p>
    <p style="font-size:12px; color:#c9d1d9;">
      ⭐ ${repo.stargazers_count} &nbsp; | &nbsp;
      🛠 ${repo.language || "N/A"} &nbsp; | &nbsp;
      ${repo.private ? "🔒 Privado" : "🌍 Público"}
    </p>
  </a>
</div>\n`;
      });
      topSection += `</div>`;

      let otherSection = `\n<br/>\n<h3 align="center">📦 Outros Projetos</h3>\n<div align="center">\n`;

      otherProjects.forEach(repo => {
        otherSection += `
<div style="margin:6px;">
  <a href="${repo.html_url}" style="color:#58a6ff; text-decoration:none;">
    <b>${repo.name}</b>
  </a>
  <span style="color:#8b949e;"> — ${repo.language || "N/A"} ${repo.private ? "🔒" : ""}</span>
</div>\n`;
      });
      otherSection += `</div>`;

      const finalContent = `${topSection}\n${otherSection}`;

      if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, "utf8");
        const updated = readme.replace(
          /[\s\S]*/,
          `\n${finalContent}\n`
        );

        fs.writeFileSync(readmePath, updated);
        console.log("✅ README atualizado com sucesso!");
      } else {
        console.error("❌ Arquivo README.md não encontrado em:", readmePath);
      }
    } catch (err) {
      console.error("❌ Erro ao processar dados:", err.message);
    }
  });
}).on("error", (err) => {
  console.error("❌ Erro na requisição HTTP:", err.message);
});