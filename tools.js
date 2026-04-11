import axios from "axios";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { tavily } from '@tavily/core';

dotenv.config();

const TEVILY_API_KEY = process.env.TEVILY_API_KEY;
const VERCEL_TOKEN = process.env.VERCEL_API_KEY;
const PROJECT_PATH = path.resolve("./lumen-blog");

// 🔥 IMPORTANT: apna actual values daalna
// const PROJECT_ID = "YOUR_PROJECT_ID";
const TEAM_ID = "team_BBS1SszSWNISqKcl7D1tcCpn";

async function search(input) {

  const client = tavily({ apiKey: TEVILY_API_KEY });
  const results = await client.search(input, {
      searchDepth: "fast"
  })
  
  const filtredData = results.results.map(e=>{
    return {
      title: e.title,
      url: e.url,
      content: e.content,
    }
  })

  return JSON.stringify(filtredData);
  
}

async function findImages(query) {
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://google.serper.dev/images',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({ "q": query, "gl": "in" }) };
  try {
    const response = await axios.request(config);
    const filtredData = response.data.images.map(e => {
      return { title: e.title, imageUrl: e.imageUrl }
    })

    return JSON.stringify(filtredData);

  } catch (error) { console.log(error); }
}

function getFiles(dir) {
  let results = [];

  function readDir(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDir(fullPath);
      } else {
        // ✅ relative path fix
        const relativePath = path.relative(PROJECT_PATH, fullPath);

        results.push({
          file: relativePath.replace(/\\/g, "/"), // windows fix
          data: fs.readFileSync(fullPath).toString("utf-8"),
        });
      }
    });
  }

  readDir(dir);
  console.log("data of the project ! => ", results)
  return results;
}

// 🚀 DEPLOY FUNCTION
async function deploy() {
  try {
    const files = getFiles(PROJECT_PATH);

    console.log("📦 Total files:", files.length);

    const response = await axios.post(
      `https://api.vercel.com/v13/deployments?teamId=${TEAM_ID}`,
      {
        name: "lumen-blog",
        files: files,
        projectSettings: {
          framework: "nextjs",
          buildCommand: "next build",
          outputDirectory: ".next",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        // params: {
        //   projectId: PROJECT_ID, // 🔥 MUST
        // },
      }
    );

    console.log("✅ Deploy Success:");
    console.log("🔗 URL:", "https://" + response.data.url);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}

// RUN
// deploy();

// getFiles(PROJECT_PATH);

export {
  findImages,
  search
}