const path = require("path");
const _ = require("lodash");
const webpackLodashPlugin = require("lodash-webpack-plugin");

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators;
  let slug;
  if (node.internal.type === "MarkdownRemark") {
    const fileNode = getNode(node.parent);
    const parsedFilePath = path.parse(fileNode.relativePath);
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "title")
    ) {
      slug = `/${_.kebabCase(node.frontmatter.title)}`;
    } else if (parsedFilePath.name !== "index" && parsedFilePath.dir !== "") {
      slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`;
    } else if (parsedFilePath.dir === "") {
      slug = `/${parsedFilePath.name}/`;
    } else {
      slug = `/${parsedFilePath.dir}/`;
    }
    if (
      Object.prototype.hasOwnProperty.call(node, "frontmatter") &&
      Object.prototype.hasOwnProperty.call(node.frontmatter, "slug")
    ) {
      slug = `/${_.kebabCase(node.frontmatter.slug)}`;
    }
    createNodeField({ node, name: "slug", value: slug });
  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createRedirect } = boundActionCreators;

  return new Promise((resolve, reject) => {
    //const postPage = path.resolve("src/templates/post.jsx");
    //const tagPage = path.resolve("src/templates/tag.jsx");
    const categoryPage = path.resolve("src/templates/category.jsx");
    resolve(
      graphql(
      `
        {
          allAirtableCategories{
            edges{
              node {
                id,
                Name,
                Description

              }
            }
          },
          allAirtableItems{
            edges{
              node{
                id,
                Name,
                Path,
                URL,
                Status,
                Public,
                Enabled
              }
            }
          }
        }
      `
    ).then(result => {
          if (result.errors) {
            reject(result.errors)
          }
          result.data.allAirtableCategories.edges.map(edge => {
            console.log(edge.node.id + "\nt\n");
            createPage({
              path: `/${_.kebabCase(edge.node.Name)}`,
              component: categoryPage,
              context: {
                name: edge.node.Name,
                id: edge.node.id
              }
            });
          });
          result.data.allAirtableItems.edges.map(edge => {
            createRedirect({
              fromPath: edge.node.Path,
              toPath: edge.node.URL
            });
          });
        })
    )
  })
};

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === "build-javascript") {
    config.plugin("Lodash", webpackLodashPlugin, null);
  }
};
