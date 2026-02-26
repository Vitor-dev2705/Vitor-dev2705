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

      const filteredRepos = repos
        .filter(repo => !repo.fork && repo.size > 0 && repo.name !== "Vitor-dev2705")
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      // Criando uma lista simples em Markdown (sem imagens)
      let content = "\n";
      filteredRepos.forEach(repo => {
        const description = repo.description ? ` - ${repo.description}` : "";
        content += `* [**${repo.name}**](${repo.html_url})${description}\n`;
      });

      const readmePath = "README.md";
      const readme = fs.readFileSync(readmePath, "utf8");
      
      const updated = readme.replace(
        /[\s\S]*/,
        `\n${content}\n`
      );

      fs.writeFileSync(readmePath, updated);
      console.log("✅ Projetos atualizados apenas com texto!");
    } catch (e) {
      console.error("❌ Erro:", e.message);
    }
  });
});