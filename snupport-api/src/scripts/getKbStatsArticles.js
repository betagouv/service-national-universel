require("../mongo");

const KnowledgeModel = require("../models/knowledgeBase");

async function getArticles() {
  try {
    const articles = await KnowledgeModel.find({}).lean();
    console.log(articles.length);
    const typo = [];
    let count = 0;
    let admin = 0;
    let structure = 0;
    let referent = 0;
    let head_center = 0;
    let visitor = 0;
    let young = 0;
    let public = 0;
    for (let article of articles) {
      console.log(article);
      for (const allowedRole of article.allowedRoles) {
        if (!typo.includes(allowedRole)) {
          typo.push(allowedRole);
        }
        // sum of articles by role
        if (allowedRole === "admin") {
          admin += 1;
        }
        if (allowedRole === "structure") {
          structure += 1;
        }
        if (allowedRole === "referent") {
          referent += 1;
        }
        if (allowedRole === "head_center") {
          head_center += 1;
        }
        if (allowedRole === "visitor") {
          visitor += 1;
        }
        if (allowedRole === "young") {
          young += 1;
        }
        if (allowedRole === "public") {
          public += 1;
        }
      }
      count += 1;
    }
    console.log("count", count);
    console.log("admin", admin);
    console.log("structure", structure);
    console.log("referent", referent);
    console.log("head_center", head_center);
    console.log("visitor", visitor);
    console.log("young", young);
    console.log("public", public);
  } catch (e) {
    console.log(e);
  }
}

getArticles();
