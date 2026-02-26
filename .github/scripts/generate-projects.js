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
      if (!Array.isArray(repos)) return;

      // Filtra repositórios (remove forks e o repo do perfil) e pega os 6 mais relevantes
      const filteredRepos = repos
        .filter(repo => !repo.fork && repo.size > 0 && repo.name !== "Vitor-dev2705")
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      let content = `\n<div align="center">\n`;

      filteredRepos.forEach(repo => {
        // Usando a API de Pins para garantir que a imagem não quebre
        content += `  <a href="${repo.html_url}">\n    <img src="https://github-readme-stats.vercel.app/api/pin/?username=Vitor-dev2705&repo=${repo.name}&theme=tokyonight&hide_border=true" />\n  </a>\n`;
      });

      content += `</div>\n`;

      const readmePath = "README.md";
      const readme = fs.readFileSync(readmePath, "utf8");
      
      // Substituição mágica entre as tags que você colocou no README
      const updated = readme.replace(
        /[\s\S]*/,
        `\n${content}\n`
      );

      fs.writeFileSync(readmePath, updated);
      console.log("✅ Lista de projetos atualizada!");
    } catch (e) {
      console.error("❌ Erro ao gerar projetos:", e.message);
    }
  });
});